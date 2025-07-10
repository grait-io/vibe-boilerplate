"""
Pickup line generation module using OpenRouter API.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import os
from app import db, redis_client
from database.models import PickupHistory, UserSettings
import json

pickup_bp = Blueprint('pickup', __name__)

# Default prompt templates
DEFAULT_PROMPTS = {
    'playful': "Generate a playful pickup line for someone who {description}. Dirtiness level: {dirtiness}/10. Make it fun and flirty!",
    'romantic': "Generate a romantic pickup line for someone who {description}. Dirtiness level: {dirtiness}/10. Make it sweet and heartfelt!",
    'funny': "Generate a funny pickup line for someone who {description}. Dirtiness level: {dirtiness}/10. Make it humorous and witty!",
    'cheesy': "Generate a cheesy pickup line for someone who {description}. Dirtiness level: {dirtiness}/10. Make it over-the-top corny!",
    'unhinged': "Generate an unhinged and wild pickup line for someone who {description}. Dirtiness level: {dirtiness}/10. Go crazy and be outrageous!"
}


@pickup_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_pickup_line():
    """Generate a pickup line based on person description and settings."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Get input parameters
    person_description = data.get('person_description')
    dirtiness_level = data.get('dirtiness_level', 5)
    style = data.get('style', 'playful')
    
    if not person_description:
        return jsonify({'error': 'Person description is required'}), 400
    
    # Validate dirtiness level
    if not 1 <= dirtiness_level <= 10:
        return jsonify({'error': 'Dirtiness level must be between 1 and 10'}), 400
    
    # Get user settings
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    # Prepare prompt
    if settings and settings.custom_prompt_template:
        prompt = settings.custom_prompt_template.format(
            description=person_description,
            dirtiness=dirtiness_level,
            style=style
        )
    else:
        prompt = DEFAULT_PROMPTS.get(style, DEFAULT_PROMPTS['playful']).format(
            description=person_description,
            dirtiness=dirtiness_level
        )
    
    # Add emoji instruction if enabled
    if settings and settings.include_emojis:
        prompt += " Include relevant emojis!"
    
    # Call OpenRouter API
    try:
        response = requests.post(
            f"{os.getenv('OPENROUTER_BASE_URL')}/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": settings.preferred_model if settings else os.getenv('DEFAULT_MODEL'),
                "messages": [
                    {"role": "system", "content": "You are a creative pickup line generator. Generate only the pickup line, nothing else."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": settings.temperature if settings else float(os.getenv('TEMPERATURE', 0.8)),
                "max_tokens": settings.max_tokens if settings else int(os.getenv('MAX_TOKENS', 150))
            }
        )
        
        response.raise_for_status()
        result = response.json()
        pickup_line = result['choices'][0]['message']['content'].strip()
        
        # Save to history
        history = PickupHistory(
            user_id=user_id,
            person_description=person_description,
            pickup_line=pickup_line,
            dirtiness_level=dirtiness_level,
            style=style,
            model_used=settings.preferred_model if settings else os.getenv('DEFAULT_MODEL')
        )
        db.session.add(history)
        db.session.commit()
        
        # Cache the result
        cache_key = f"pickup:{user_id}:{person_description}:{dirtiness_level}:{style}"
        redis_client.setex(cache_key, 3600, pickup_line)  # Cache for 1 hour
        
        return jsonify({
            'pickup_line': pickup_line,
            'history_id': str(history.id),
            'style': style,
            'dirtiness_level': dirtiness_level
        }), 200
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to generate pickup line: {str(e)}'}), 500


@pickup_bp.route('/regenerate/<history_id>', methods=['POST'])
@jwt_required()
def regenerate_pickup_line(history_id):
    """Regenerate a pickup line based on previous history entry."""
    user_id = get_jwt_identity()
    
    # Get history entry
    history = PickupHistory.query.filter_by(id=history_id, user_id=user_id).first()
    if not history:
        return jsonify({'error': 'History entry not found'}), 404
    
    # Generate new pickup line with same parameters
    data = {
        'person_description': history.person_description,
        'dirtiness_level': history.dirtiness_level,
        'style': history.style
    }
    
    # Use the generate endpoint logic
    request.json = data
    return generate_pickup_line()


@pickup_bp.route('/rate/<history_id>', methods=['POST'])
@jwt_required()
def rate_pickup_line(history_id):
    """Rate a pickup line."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    rating = data.get('rating')
    used = data.get('used', False)
    success = data.get('success')
    notes = data.get('notes')
    
    if rating and not 1 <= rating <= 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    
    # Update history entry
    history = PickupHistory.query.filter_by(id=history_id, user_id=user_id).first()
    if not history:
        return jsonify({'error': 'History entry not found'}), 404
    
    if rating:
        history.rating = rating
    if used is not None:
        history.used = used
    if success is not None:
        history.success = success
    if notes:
        history.notes = notes
    
    db.session.commit()
    
    return jsonify({'message': 'Rating updated successfully'}), 200