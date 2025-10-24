# Hardware Control Service

A FastAPI-based microservice that provides authentication, service discovery, hardware orchestration, and data processing primitives tailored for microservice and hardware control workloads.

## Features

- **Modular architecture** with clearly separated API, service, and infrastructure layers
- **JWT authentication** with OAuth2 password flow and API key validation for service-to-service calls
- **SQLAlchemy ORM** with Alembic migrations and PostgreSQL/SQLite support
- **Structured logging** powered by `structlog`
- **Service discovery** with registry endpoints and HTTP proxying utilities
- **Hardware abstraction layer** for device communication with extensible adapters
- **Redis-backed caching** (with graceful in-memory fallback) and messaging primitives
- **Data ingestion & analytics** leveraging `pandas` and `numpy`
- **System management** endpoints for commands, filesystem, and environment variables
- **API documentation** automatically available via Swagger UI (`/docs`) and OpenAPI (`/api/v1/openapi.json`)

## Getting Started

### Prerequisites

- Python 3.10+
- Poetry or pip (the project is managed via `pyproject.toml`)
- Optional: Redis and PostgreSQL for full functionality (SQLite is used by default)

### Setup

```bash
# From the repository root
cd backend
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e .[dev]

cp ../.env.example .env  # provides defaults for development
```

### Database Migrations

```bash
alembic upgrade head   # Apply migrations
alembic revision --autogenerate -m "message"  # Create new migrations
```

The default configuration points to `sqlite:///./hardware_control.db`. Override `FASTAPI_DATABASE_URL` to target PostgreSQL in production environments.

### Running the Service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Swagger documentation is available at `http://localhost:8000/docs`.

### Testing

```bash
pytest
```

### Key Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `FASTAPI_SECRET_KEY` | Secret used for signing JWT tokens. | `changeme` |
| `FASTAPI_DATABASE_URL` | SQLAlchemy database URL. | `sqlite:///./hardware_control.db` |
| `FASTAPI_REDIS_URL` | Redis connection URL for cache/message broker. | `redis://localhost:6379/0` |
| `FASTAPI_SERVICE_API_KEYS` | Comma-separated list of API keys for service registration. | *(empty)* |
| `FASTAPI_BACKEND_CORS_ORIGINS` | Comma-separated CORS origins. | `*` |

See `.env.example` for an extended list of configuration options.

## Docker

The service ships with a production-ready Dockerfile and docker-compose profile (see repository root). Build as follows:

```bash
docker compose up --build api
```

This starts the API alongside Redis and PostgreSQL when configured in `docker-compose.yml`.

## Project Structure

```
backend/
  app/
    api/          # FastAPI routers and dependencies
    core/         # Configuration, logging, lifecycle events
    db/           # Database session and metadata
    models/       # SQLAlchemy models
    schemas/      # Pydantic schemas
    security/     # JWT & API key helpers
    services/     # Business/domain services (cache, messaging, hardware, etc)
    main.py       # Application factory
  alembic/        # Migration scripts
  tests/          # Pytest suites
```

Feel free to extend adapters, services, and schemas to match the hardware environment and microservice ecosystem for your project.
