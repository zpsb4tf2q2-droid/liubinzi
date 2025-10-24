"""Custom Starlette/FastAPI middleware implementations."""

from __future__ import annotations

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

import structlog

logger = structlog.get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that emits structured logs for every HTTP request/response pair."""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        start_time = time.perf_counter()
        logger.info(
            "request.started",
            method=request.method,
            url=str(request.url),
            client=request.client.host if request.client else None,
        )
        try:
            response = await call_next(request)
        except Exception as exc:  # pragma: no cover - re-raised immediately after logging
            process_time = time.perf_counter() - start_time
            logger.exception(
                "request.failed",
                method=request.method,
                url=str(request.url),
                client=request.client.host if request.client else None,
                duration_ms=round(process_time * 1000, 2),
            )
            raise exc

        process_time = time.perf_counter() - start_time
        logger.info(
            "request.completed",
            method=request.method,
            url=str(request.url),
            status_code=response.status_code,
            duration_ms=round(process_time * 1000, 2),
        )
        return response
