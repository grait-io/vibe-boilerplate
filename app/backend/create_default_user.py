#!/usr/bin/env python3
"""
Script to create default user for development.
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from database.models import User, UserSettings
from werkzeug.security import generate_password_hash

def create_default_user():
    """Create default user Marek with password 'horny'."""
    app = create_app()
    
    with app.app_context():
        # Create all tables first
        db.create_all()
        print("Database tables created/verified.")
        
        # Check if user already exists
        existing_user = User.query.filter_by(username='Marek').first()
        if existing_user:
            print("User 'Marek' already exists.")
            return
        
        # Create default user
        user = User(
            username='Marek',
            email='marek@example.com',
            password_hash=generate_password_hash('horny')
        )
        
        # Create default settings
        settings = UserSettings(user=user)
        
        # Add to database
        db.session.add(user)
        db.session.add(settings)
        db.session.commit()
        
        print(f"Default user created successfully:")
        print(f"Username: Marek")
        print(f"Password: horny")
        print(f"Email: marek@example.com")
        print(f"User ID: {user.id}")

if __name__ == '__main__':
    create_default_user()