"""Application lifecycle events."""

from __future__ import annotations

import structlog
from fastapi import FastAPI

from app.core.config import settings
from app.services.cache import RedisCache
from app.services.http_client import HTTPClient
from app.services.messaging import RedisMessageBroker
from app.services.service_registry import ServiceRegistry

logger = structlog.get_logger(__name__)


async def on_startup(app: FastAPI) -> None:
    """Initialize shared service instances on application startup."""

    app.state.settings = settings

    cache = RedisCache(settings.redis_url)
    await cache.connect()
    app.state.cache = cache

    http_client = HTTPClient(
        timeout=settings.http_client_timeout,
        retries=settings.http_client_retries,
        rate_limit=settings.http_rate_limit,
        period=settings.http_rate_period_seconds,
    )
    app.state.http_client = http_client

    service_registry = ServiceRegistry(initial_services=settings.service_registry_endpoints)
    app.state.service_registry = service_registry

    if settings.message_broker_enabled:
        broker = RedisMessageBroker(settings.redis_url, channel=settings.message_broker_channel)
        await broker.connect()
        app.state.message_broker = broker
    else:
        app.state.message_broker = None

    logger.info("application.startup.completed", cache_available=cache.is_available)


async def on_shutdown(app: FastAPI) -> None:
    """Tear down shared service instances on application shutdown."""

    cache: RedisCache | None = getattr(app.state, "cache", None)
    if cache is not None:
        await cache.close()

    http_client: HTTPClient | None = getattr(app.state, "http_client", None)
    if http_client is not None:
        await http_client.close()

    broker: RedisMessageBroker | None = getattr(app.state, "message_broker", None)
    if broker is not None:
        await broker.close()

    logger.info("application.shutdown.completed")
