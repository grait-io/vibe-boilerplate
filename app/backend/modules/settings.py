"""
User settings management module.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from database.models import UserSettings
from datetime import datetime

settings_bp = Blueprint('settings', __name__)


@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    """Get user settings."""
    user_id = get_jwt_identity()
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    
    return jsonify({
        'custom_prompt_template': settings.custom_prompt_template,
        'preferred_model': settings.preferred_model,
        'temperature': settings.temperature,
        'max_tokens': settings.max_tokens,
        'default_dirtiness_level': settings.default_dirtiness_level,
        'include_emojis': settings.include_emojis,
        'preferred_style': settings.preferred_style,
        'updated_at': settings.updated_at.isoformat()
    }), 200


@settings_bp.route('/', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update user settings."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    
    # Update fields if provided
    if 'custom_prompt_template' in data:
        settings.custom_prompt_template = data['custom_prompt_template']
    
    if 'preferred_model' in data:
        settings.preferred_model = data['preferred_model']
    
    if 'temperature' in data:
        temp = data['temperature']
        if not 0 <= temp <= 2:
            return jsonify({'error': 'Temperature must be between 0 and 2'}), 400
        settings.temperature = temp
    
    if 'max_tokens' in data:
        tokens = data['max_tokens']
        if not 50 <= tokens <= 500:
            return jsonify({'error': 'Max tokens must be between 50 and 500'}), 400
        settings.max_tokens = tokens
    
    if 'default_dirtiness_level' in data:
        level = data['default_dirtiness_level']
        if not 1 <= level <= 10:
            return jsonify({'error': 'Dirtiness level must be between 1 and 10'}), 400
        settings.default_dirtiness_level = level
    
    if 'include_emojis' in data:
        settings.include_emojis = bool(data['include_emojis'])
    
    if 'preferred_style' in data:
        style = data['preferred_style']
        valid_styles = ['playful', 'romantic', 'funny', 'cheesy', 'unhinged']
        if style not in valid_styles:
            return jsonify({'error': f'Style must be one of: {", ".join(valid_styles)}'}), 400
        settings.preferred_style = style
    
    settings.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Settings updated successfully'}), 200


@settings_bp.route('/models', methods=['GET'])
@jwt_required()
def get_available_models():
    """Get list of available OpenRouter models."""
    # Popular models for pickup line generation
    models = [
        {
            'id': 'meta-llama/llama-3.2-3b-instruct:free',
            'name': 'Llama 3.2 3B (Free)',
            'description': 'Fast and free model, good for basic pickup lines'
        },
        {
            'id': 'nousresearch/hermes-3-llama-3.1-405b:free',
            'name': 'Hermes 3 Llama 405B (Free)',
            'description': 'Powerful free model, great for creative content'
        },
        {
            'id': 'google/gemini-flash-1.5',
            'name': 'Gemini Flash 1.5',
            'description': 'Fast Google model with good creativity'
        },
        {
            'id': 'anthropic/claude-3-haiku',
            'name': 'Claude 3 Haiku',
            'description': 'Balanced model with good language understanding'
        },
        {
            'id': 'openai/gpt-4o-mini',
            'name': 'GPT-4o Mini',
            'description': 'OpenAI model with excellent creativity'
        },
        {
            'id': 'mistralai/mistral-large',
            'name': 'Mistral Large',
            'description': 'Unhinged model, perfect for wild pickup lines'
        }
    ]
    
    return jsonify({'models': models}), 200