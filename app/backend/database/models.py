"""
Database models for the Pickup Line Generator.
"""
from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import UUID
import uuid


class User(db.Model):
    """User model for authentication and personalization."""
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    settings = db.relationship('UserSettings', backref='user', uselist=False, cascade='all, delete-orphan')
    pickup_history = db.relationship('PickupHistory', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'


class UserSettings(db.Model):
    """User settings for customizing pickup line generation."""
    __tablename__ = 'user_settings'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Prompt customization
    custom_prompt_template = db.Column(db.Text, nullable=True)
    preferred_model = db.Column(db.String(100), default='meta-llama/llama-3.2-3b-instruct:free')
    temperature = db.Column(db.Float, default=0.8)
    max_tokens = db.Column(db.Integer, default=150)
    
    # Default settings
    default_dirtiness_level = db.Column(db.Integer, default=5)  # 1-10 scale
    include_emojis = db.Column(db.Boolean, default=True)
    preferred_style = db.Column(db.String(50), default='playful')  # playful, romantic, funny, cheesy
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PickupHistory(db.Model):
    """History of generated pickup lines."""
    __tablename__ = 'pickup_history'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    # Generation details
    person_description = db.Column(db.Text, nullable=False)
    pickup_line = db.Column(db.Text, nullable=False)
    dirtiness_level = db.Column(db.Integer, nullable=False)
    style = db.Column(db.String(50), nullable=False)
    
    # Metadata
    model_used = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=True)  # User rating 1-5
    used = db.Column(db.Boolean, default=False)  # Whether it was actually used
    success = db.Column(db.Boolean, nullable=True)  # Whether it worked
    notes = db.Column(db.Text, nullable=True)  # User notes
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PickupHistory {self.id}>'