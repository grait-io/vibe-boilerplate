# Modules Overview

## Backend Modules

### auth.py
- **Purpose**: User authentication and registration
- **Endpoints**:
  - `POST /api/auth/register` - Create new user account
  - `POST /api/auth/login` - Authenticate user
  - `GET /api/auth/me` - Get current user info
- **Owner**: Authentication Team

### pickup.py
- **Purpose**: Core pickup line generation functionality
- **Endpoints**:
  - `POST /api/pickup/generate` - Generate new pickup line
  - `POST /api/pickup/regenerate/<id>` - Regenerate with same parameters
  - `POST /api/pickup/rate/<id>` - Rate and update pickup line
- **Dependencies**: OpenRouter API, Redis cache
- **Owner**: AI Integration Team

### settings.py
- **Purpose**: User preference management
- **Endpoints**:
  - `GET /api/settings/` - Retrieve user settings
  - `PUT /api/settings/` - Update user settings
  - `GET /api/settings/models` - List available AI models
- **Owner**: User Experience Team

### history.py
- **Purpose**: Pickup line history and statistics
- **Endpoints**:
  - `GET /api/history/` - Paginated history with filters
  - `GET /api/history/stats` - Aggregated statistics
  - `DELETE /api/history/<id>` - Delete history item
- **Owner**: Analytics Team

### database/models.py
- **Purpose**: SQLAlchemy database models
- **Models**:
  - `User` - User accounts
  - `UserSettings` - User preferences
  - `PickupHistory` - Generated pickup lines
- **Owner**: Database Team

## Frontend Components

### Layout.jsx
- **Purpose**: Main application layout with navigation
- **Features**: Responsive drawer, mobile support
- **Owner**: UI/UX Team

### Generator.jsx
- **Purpose**: Main pickup line generation interface
- **Features**: Real-time generation, customization controls
- **Owner**: Frontend Team

### History.jsx
- **Purpose**: Browse and manage pickup line history
- **Features**: Search, filters, ratings, notes
- **Owner**: Frontend Team

### Settings.jsx
- **Purpose**: User preference configuration
- **Features**: Model selection, prompt customization
- **Owner**: Frontend Team

### Stats.jsx
- **Purpose**: Analytics and usage statistics
- **Features**: Charts, success metrics, trends
- **Owner**: Analytics Team

## Services

### AuthContext.js
- **Purpose**: Authentication state management
- **Features**: Login/logout, token management
- **Owner**: Frontend Team

### api.js
- **Purpose**: Axios API client configuration
- **Features**: Interceptors, error handling
- **Owner**: Frontend Team

## Integration Points

1. **Frontend ↔ Backend**: RESTful API over HTTP
2. **Backend ↔ OpenRouter**: HTTPS API calls
3. **Backend ↔ PostgreSQL**: SQLAlchemy ORM
4. **Backend ↔ Redis**: Flask-Redis client
5. **Components ↔ AuthContext**: React Context API