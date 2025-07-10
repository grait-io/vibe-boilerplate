# Pickup Line Generator

An AI-powered pickup line generator with customizable settings, built with Flask, React, and OpenRouter integration.

## Features

- **AI-Powered Generation**: Uses OpenRouter to access various language models for creative pickup lines
- **Customizable Dirtiness Levels**: Scale from 1 (innocent) to 10 (spicy)
- **Multiple Styles**: Playful, romantic, funny, cheesy, or unhinged
- **Mobile-Friendly**: Responsive React UI that works great on all devices
- **History Tracking**: Keep track of all generated pickup lines with ratings and notes
- **Statistics Dashboard**: View usage patterns and success rates
- **Custom Settings**: Configure preferred models, prompts, and default preferences
- **User Authentication**: Secure login system with JWT tokens

## Tech Stack

- **Backend**: Flask (Python) with PostgreSQL and Redis
- **Frontend**: React with Material-UI
- **AI Integration**: OpenRouter API
- **Containerization**: Docker Compose
- **Authentication**: JWT tokens

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your settings:
   ```bash
   cp .env.example .env
   ```
3. Add your OpenRouter API key to the `.env` file
4. Start the application:
   ```bash
   docker-compose up
   ```
5. Access the application at http://localhost:3000

## Default Login

For development, a default user is created automatically:

- **Username**: `Marek`
- **Password**: `horny`

You can use these credentials to login immediately without registering.

## Environment Variables

Key environment variables to configure:

- `OPENROUTER_API_KEY`: Your OpenRouter API key (required)
- `SECRET_KEY`: Flask secret key for sessions
- `DATABASE_URL`: PostgreSQL connection string
- `DEFAULT_MODEL`: Default AI model to use
- `TEMPERATURE`: Model temperature (0-2)
- `MAX_TOKENS`: Maximum response length

## Development

The application uses Docker Compose with volume mapping for live code editing:

- Backend changes are automatically reloaded
- Frontend uses React hot reloading
- Database persists in `./db_data`

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/pickup/generate` - Generate pickup line
- `GET /api/history/` - Get pickup line history
- `GET /api/history/stats` - Get usage statistics
- `GET/PUT /api/settings/` - Manage user settings

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines.

## License

MIT License