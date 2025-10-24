"""FastAPI dependency functions."""

from __future__ import annotations

from typing import Generator

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.security.jwt import oauth2_scheme, verify_access_token
from app.services import DataProcessor
from app.services.cache import RedisCache
from app.services.http_client import HTTPClient
from app.services.messaging import MessageBroker
from app.services.service_registry import ServiceRegistry


def get_db_session() -> Generator[Session, None, None]:
    yield from get_db()


def get_cache(request: Request) -> RedisCache:
    cache: RedisCache | None = getattr(request.app.state, "cache", None)
    if cache is None:
        raise HTTPException(status_code=503, detail="Cache backend not initialised")
    return cache


def get_http_client(request: Request) -> HTTPClient:
    client: HTTPClient | None = getattr(request.app.state, "http_client", None)
    if client is None:
        raise HTTPException(status_code=503, detail="HTTP client not initialised")
    return client


def get_service_registry(request: Request) -> ServiceRegistry:
    registry: ServiceRegistry | None = getattr(request.app.state, "service_registry", None)
    if registry is None:
        raise HTTPException(status_code=503, detail="Service registry unavailable")
    return registry


def get_message_broker(request: Request) -> MessageBroker | None:
    return getattr(request.app.state, "message_broker", None)


def get_data_processor(cache: RedisCache = Depends(get_cache)) -> DataProcessor:
    return DataProcessor(cache=cache)


def get_current_user(
    db: Session = Depends(get_db_session),
    token: str = Depends(oauth2_scheme),
) -> User:
    payload = verify_access_token(token)
    user = db.query(User).filter(User.id == int(payload.sub)).first() if payload.sub else None
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
    return current_user
