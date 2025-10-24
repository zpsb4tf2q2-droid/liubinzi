"""FastAPI application entrypoint."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog

from app.api.router import api_router
from app.core.config import settings
from app.core.events import on_shutdown, on_startup
from app.core.logging import configure_logging
from app.core.middleware import RequestLoggingMiddleware

logger = structlog.get_logger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""

    configure_logging(settings.log_level)

    openapi_url = f"{settings.api_v1_prefix}/openapi.json"
    docs_url = f"{settings.api_v1_prefix}/docs" if settings.debug else "/docs"

    app = FastAPI(
        title=settings.project_name,
        version="0.1.0",
        debug=settings.debug,
        openapi_url=openapi_url,
        docs_url=docs_url,
        redoc_url=f"{settings.api_v1_prefix}/redoc" if settings.debug else "/redoc",
    )

    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.backend_cors_origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:  # pragma: no cover - defensive guard
        logger.exception("request.unhandled_exception", path=str(request.url))
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.on_event("startup")
    async def _startup_event() -> None:  # pragma: no cover - FastAPI lifecycle wiring
        await on_startup(app)

    @app.on_event("shutdown")
    async def _shutdown_event() -> None:  # pragma: no cover - FastAPI lifecycle wiring
        await on_shutdown(app)

    return app


app = create_app()
