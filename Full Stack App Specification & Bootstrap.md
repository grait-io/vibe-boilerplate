
# Full Stack App Specification \& Bootstrap Instructions

This specification enables rapid, modular, AI-driven development with multi-agent collaboration, live code editing, and full Docker Compose orchestration—including database and persistent storage. All instructions and templates are ready for direct use.

## 1. AI Bootstrapping Prompt

> **Prompt for AI Project Initialization**
>
> You are an expert AI software architect and engineer. Your task is to select the most appropriate technology stack and generate the initial project boilerplate for a modular, full stack application, following these requirements:
>
> - **Stack Selection:**
>   Analyze the project context and requirements to choose between:
>   - **Streamlit** (for fast, data-driven prototyping and simple UIs)
>   - **Flask (or Django) + Modern Frontend** (for production-ready, scalable, and customizable applications)
>   Use the stack selection guide below to justify your choice.
>
> - **Project Structure:**
>   Scaffold the project with a modular directory layout, Dockerization, and `.env` environment variable support.
>
> - **Documentation:**
>   Include initial documentation files as described, with clear module docstrings and a high-level architecture overview.
>
> - **Multi-Agent Development:**
>   Ensure each feature is in its own module to support parallel development by multiple agents.
>
> - **Deployment:**
>   Make the project ready for deployment with Coolify.
>
> - **Docker Compose:**
>   All services (backend, frontend, database) must run inside containers. Use volume mapping for live code editing and persistent database storage.
>
> Output only the code and files necessary for the initial boilerplate, following the provided specification. Clearly indicate which stack was chosen and why, then proceed to generate the project structure.

## 2. Stack Selection Guide

| Use Case/Need | Streamlit | Flask (or Django) + Modern Frontend |
| :-- | :-- | :-- |
| Rapid prototyping, data apps, ML demos | **Best fit** | Possible, but slower |
| Custom UI, complex workflows | Limited | **Best fit** |
| Production-grade, scalable apps | Not ideal | **Best fit** |
| Minimal setup, Python-only | **Best fit** | More setup needed |
| Extensibility, large codebase, modularity | Limited | **Best fit** |
| Data visualization, dashboards | **Best fit** | Possible, more work |
| Authentication, user management | Not built-in | **Built-in/Extensible** |

## 3. Directory Structure

### Streamlit (Python-only Example)

```
/app
  /modules
    __init__.py
    user.py
    auth.py
    ...
  app.py
  requirements.txt
  .env
  Dockerfile
  docker-compose.yml
  README.md
  /docs
    architecture.md
    modules_overview.md
    CONTRIBUTING.md
  /db_data
```


### Flask (or Django) + Modern Frontend (React Example)

```
/app
  /backend
    /modules
      __init__.py
      user.py
      auth.py
      ...
    app.py
    requirements.txt
  /frontend
    /src
      /components
      /pages
      App.jsx
    package.json
  .env
  Dockerfile
  docker-compose.yml
  README.md
  /docs
    architecture.md
    modules_overview.md
    api_reference.md
    CONTRIBUTING.md
  /db_data
```


## 4. Example `docker-compose.yml` (Flask + React + PostgreSQL)

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    command: flask run --host=0.0.0.0 --reload
    volumes:
      - ./backend:/usr/src/app/backend
    env_file:
      - .env
    ports:
      - "5000:5000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    command: npm start
    volumes:
      - ./frontend:/usr/src/app/frontend
      - /usr/src/app/frontend/node_modules
    env_file:
      - .env
    ports:
      - "3000:3000"

  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - ./db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```


## 5. Example `.env` File

```
# Backend
FLASK_ENV=development
SECRET_KEY=your-secret
DATABASE_URL=postgresql://user:password@db:5432/myapp

# Frontend
REACT_APP_API_URL=http://localhost:5000/api

# Database
POSTGRES_DB=myapp
POSTGRES_USER=user
POSTGRES_PASSWORD=password
```


## 6. Documentation Requirements

- **README.md**
    - Project overview, stack rationale, quick start, contribution summary
- **/docs/architecture.md**
    - System architecture, backend/frontend integration, deployment flow
- **/docs/modules_overview.md**
    - Module list, purpose, ownership
- **/docs/api_reference.md** (for Flask/Django)
    - REST endpoints, example requests/responses
- **/docs/CONTRIBUTING.md**
    - Branching, code review, testing, documentation standards
- **Module-level docstrings, function/class docstrings, and inline comments** for clarity and maintainability


## 7. Modularity \& Multi-Agent Collaboration

- One module per feature (e.g., `/modules/user.py`)
- No monolithic files; keep files under 200 lines where possible
- Self-contained logic and clear interfaces
- Automated lightweight tests for each module
- Module ownership and integration contracts documented


## 8. Live Code Editing with Volume Mapping

- All code directories are volume-mapped in `docker-compose.yml`
- Edit code on your host; changes are reflected instantly in containers
- Backend and frontend use development servers with auto-reload
- Database persists data in `/db_data` volume




## 9. AI Bootstrapping Workflow

- Use the AI prompt above to:
    - Analyze requirements and select the stack
    - Scaffold the directory structure and Docker files
    - Set up initial documentation and module templates
    - Ensure all services are containerized and live-editable
    - Output only the necessary code and files for the boilerplate



