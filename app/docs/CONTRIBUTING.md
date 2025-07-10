# Contributing Guidelines

## Development Setup

1. Fork and clone the repository
2. Copy `.env.example` to `.env` and configure
3. Run `docker-compose up` to start all services
4. Backend runs on http://localhost:5000
5. Frontend runs on http://localhost:3000

## Code Standards

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where appropriate
- Add docstrings to all functions and classes
- Maximum line length: 88 characters (Black formatter)

### JavaScript (Frontend)
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- PropTypes or TypeScript for type safety

### Git Workflow

1. Create feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create Pull Request to `main` branch

## Commit Message Format

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes

## Testing

### Backend Tests
```bash
docker-compose exec backend pytest
```

### Frontend Tests
```bash
docker-compose exec frontend npm test
```

## Code Review Process

1. All PRs require at least one review
2. Address all review comments
3. Ensure CI/CD passes
4. Update documentation if needed

## Module Ownership

When modifying modules, notify the respective owners:
- Authentication: @auth-team
- AI Integration: @ai-team
- Frontend: @frontend-team
- Database: @database-team
- Analytics: @analytics-team

## Documentation

- Update README.md for user-facing changes
- Update architecture.md for system changes
- Update API documentation for endpoint changes
- Add inline comments for complex logic

## Performance Guidelines

- Cache expensive operations
- Optimize database queries
- Lazy load frontend components
- Monitor bundle size

## Security

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries
- Keep dependencies updated

## Questions?

Open an issue or reach out to the maintainers.