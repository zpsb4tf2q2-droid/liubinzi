"""Health and readiness checks."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.api.deps import get_cache, get_db_session, get_service_registry
from app.core.config import settings
from app.schemas.system import HealthStatus
from app.services.cache import RedisCache
from app.services.service_registry import ServiceRegistry

router = APIRouter(prefix="/health")


@router.get("", response_model=HealthStatus)
async def health_check(
    db: Session = Depends(get_db_session),
    cache: RedisCache = Depends(get_cache),
    registry: ServiceRegistry = Depends(get_service_registry),
) -> HealthStatus:
    db_status = "ok"
    try:
        await run_in_threadpool(lambda: db.execute(text("SELECT 1")))
    except Exception:  # pragma: no cover - depends on database availability
        db_status = "error"

    cache_status = "ok" if await cache.ping() else "degraded"
    services = await registry.list()

    return HealthStatus(
        status="ok" if db_status == "ok" else "degraded",
        application=settings.project_name,
        database=db_status,
        cache=cache_status,
        services=services,
    )
