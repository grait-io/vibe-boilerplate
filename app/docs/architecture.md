# System Architecture

## Overview

The Pickup Line Generator is a full-stack web application built with a microservices architecture using Docker Compose.

## Components

### Frontend (React)
- **Technology**: React 18 with Material-UI
- **Purpose**: Provides a responsive, mobile-friendly user interface
- **Key Features**:
  - Single Page Application (SPA) with React Router
  - Material-UI for consistent design
  - Recharts for data visualization
  - Axios for API communication

### Backend (Flask)
- **Technology**: Flask with SQLAlchemy
- **Purpose**: RESTful API server handling business logic
- **Key Features**:
  - JWT-based authentication
  - PostgreSQL for data persistence
  - Redis for caching
  - OpenRouter integration for AI models

### Database (PostgreSQL)
- **Purpose**: Primary data storage
- **Schema**:
  - Users table: Authentication and user profiles
  - UserSettings table: Customizable preferences
  - PickupHistory table: Generated pickup lines with metadata

### Cache (Redis)
- **Purpose**: Performance optimization
- **Use Cases**:
  - API response caching
  - Session management
  - Rate limiting

## Data Flow

1. **User Registration/Login**:
   - Frontend → Backend API → PostgreSQL
   - JWT token returned and stored in localStorage

2. **Pickup Line Generation**:
   - Frontend sends request → Backend
   - Backend checks cache → If miss, calls OpenRouter API
   - Response cached in Redis
   - History saved to PostgreSQL
   - Result returned to Frontend

3. **Statistics**:
   - Frontend requests stats → Backend
   - Backend aggregates data from PostgreSQL
   - Formatted response sent to Frontend
   - Charts rendered with Recharts

## Security

- JWT tokens for authentication
- Password hashing with Werkzeug
- CORS configured for frontend origin
- Environment variables for sensitive data
- Docker network isolation

## Scalability Considerations

- Stateless backend design
- Redis for caching frequent requests
- Database indexing on common queries
- Docker Compose for easy deployment
- Modular architecture for feature additions