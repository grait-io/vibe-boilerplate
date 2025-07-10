# System Architecture

## Overview

This hello world application demonstrates a minimal yet scalable architecture using Streamlit and Docker.

## Components

### Application Layer
- **Streamlit App** (`app.py`): Main application entry point
- **Modules** (`/modules`): Modular features package for future expansion

### Infrastructure Layer
- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration
- **Volume Mapping**: Live code editing capability

## Data Flow

1. User accesses the application at http://localhost:8501
2. Streamlit server processes requests
3. Python code executes in the container
4. Results are rendered in the browser
5. File changes trigger automatic reload

## Development Workflow

```
Host Machine                    Docker Container
    |                                |
    | (edit files)                   |
    |--------------->  Volume  ----->|
    |                 Mapping        | (auto-reload)
    |                                |
    |<-------------- Response -------|
```

## Deployment Readiness

The application is structured for easy deployment to:
- Local Docker environments
- Cloud platforms (AWS, GCP, Azure)
- Coolify or similar PaaS solutions