"""
Pickup history and statistics module.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc
from app import db
from database.models import PickupHistory
from datetime import datetime, timedelta

history_bp = Blueprint('history', __name__)


@history_bp.route('/', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's pickup line history with pagination."""
    user_id = get_jwt_identity()
    
    # Pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Filter parameters
    style = request.args.get('style')
    min_rating = request.args.get('min_rating', type=int)
    used_only = request.args.get('used_only', 'false').lower() == 'true'
    success_only = request.args.get('success_only', 'false').lower() == 'true'
    
    # Build query
    query = PickupHistory.query.filter_by(user_id=user_id)
    
    if style:
        query = query.filter_by(style=style)
    if min_rating:
        query = query.filter(PickupHistory.rating >= min_rating)
    if used_only:
        query = query.filter_by(used=True)
    if success_only:
        query = query.filter_by(success=True)
    
    # Order by most recent
    query = query.order_by(desc(PickupHistory.created_at))
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Format results
    history = []
    for item in pagination.items:
        history.append({
            'id': str(item.id),
            'person_description': item.person_description,
            'pickup_line': item.pickup_line,
            'dirtiness_level': item.dirtiness_level,
            'style': item.style,
            'model_used': item.model_used,
            'rating': item.rating,
            'used': item.used,
            'success': item.success,
            'notes': item.notes,
            'created_at': item.created_at.isoformat()
        })
    
    return jsonify({
        'history': history,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200


@history_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get user's pickup line statistics."""
    user_id = get_jwt_identity()
    
    # Time range parameter
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Overall stats
    total_generated = db.session.query(func.count(PickupHistory.id))\
        .filter_by(user_id=user_id).scalar()
    
    total_used = db.session.query(func.count(PickupHistory.id))\
        .filter_by(user_id=user_id, used=True).scalar()
    
    total_successful = db.session.query(func.count(PickupHistory.id))\
        .filter_by(user_id=user_id, success=True).scalar()
    
    # Average rating
    avg_rating = db.session.query(func.avg(PickupHistory.rating))\
        .filter_by(user_id=user_id)\
        .filter(PickupHistory.rating.isnot(None)).scalar()
    
    # Style distribution
    style_stats = db.session.query(
        PickupHistory.style,
        func.count(PickupHistory.id).label('count')
    ).filter_by(user_id=user_id)\
     .group_by(PickupHistory.style).all()
    
    # Dirtiness level distribution
    dirtiness_stats = db.session.query(
        PickupHistory.dirtiness_level,
        func.count(PickupHistory.id).label('count')
    ).filter_by(user_id=user_id)\
     .group_by(PickupHistory.dirtiness_level).all()
    
    # Success rate by style
    success_by_style = db.session.query(
        PickupHistory.style,
        func.count(PickupHistory.id).label('total'),
        func.sum(func.cast(PickupHistory.success, db.Integer)).label('successful')
    ).filter_by(user_id=user_id, used=True)\
     .group_by(PickupHistory.style).all()
    
    # Recent activity (last 7 days)
    recent_activity = db.session.query(
        func.date(PickupHistory.created_at).label('date'),
        func.count(PickupHistory.id).label('count')
    ).filter(
        PickupHistory.user_id == user_id,
        PickupHistory.created_at >= datetime.utcnow() - timedelta(days=7)
    ).group_by(func.date(PickupHistory.created_at)).all()
    
    # Format stats
    stats = {
        'overview': {
            'total_generated': total_generated,
            'total_used': total_used,
            'total_successful': total_successful,
            'success_rate': (total_successful / total_used * 100) if total_used > 0 else 0,
            'average_rating': round(avg_rating, 2) if avg_rating else None
        },
        'style_distribution': {
            style: count for style, count in style_stats
        },
        'dirtiness_distribution': {
            str(level): count for level, count in dirtiness_stats
        },
        'success_by_style': {
            style: {
                'total': total,
                'successful': successful or 0,
                'rate': ((successful or 0) / total * 100) if total > 0 else 0
            }
            for style, total, successful in success_by_style
        },
        'recent_activity': [
            {
                'date': date.isoformat() if date else None,
                'count': count
            }
            for date, count in recent_activity
        ]
    }
    
    return jsonify(stats), 200


@history_bp.route('/<history_id>', methods=['DELETE'])
@jwt_required()
def delete_history_item(history_id):
    """Delete a specific history item."""
    user_id = get_jwt_identity()
    
    history = PickupHistory.query.filter_by(id=history_id, user_id=user_id).first()
    if not history:
        return jsonify({'error': 'History item not found'}), 404
    
    db.session.delete(history)
    db.session.commit()
    
    return jsonify({'message': 'History item deleted successfully'}), 200