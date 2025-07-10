# Hello World Streamlit App

A simple hello world application built with Streamlit to test the Docker Compose development environment.

## Stack Choice Rationale

We chose **Streamlit** for this hello world application because:
- Minimal setup required (Python-only)
- Fastest path to a working application
- Built-in live reload for development
- Perfect for testing the Docker infrastructure
- No need for separate frontend/backend complexity

## Quick Start

1. Make sure Docker and Docker Compose are installed on your system.

2. Navigate to the app directory:
   ```bash
   cd app
   ```

3. Start the application:
   ```bash
   docker-compose up --build
   ```

4. Open your browser and visit: http://localhost:8501

5. The app will automatically reload when you make changes to the code!

## Project Structure

```
/app
  /modules          # Modular features (ready for expansion)
    __init__.py
  /docs            # Documentation
  app.py           # Main Streamlit application
  requirements.txt # Python dependencies
  .env             # Environment variables
  Dockerfile       # Container configuration
  docker-compose.yml # Multi-container orchestration
```

## Features

- Simple hello world interface
- Environment variable demonstration
- Interactive elements (text input, button)
- Live code editing with automatic reload
- Containerized deployment ready

## Development

The application runs in a Docker container with volume mapping, allowing you to:
- Edit code on your host machine
- See changes immediately in the browser
- Maintain all benefits of containerization

## Next Steps

This boilerplate is ready for:
- Adding database connectivity (PostgreSQL, MySQL, etc.)
- Implementing authentication modules
- Building data visualization features
- Scaling to production with Coolify