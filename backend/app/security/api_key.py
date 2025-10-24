"""API key authentication helpers."""

from __future__ import annotations

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader, APIKeyQuery
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
api_key_query = APIKeyQuery(name="api_key", auto_error=False)


def _resolve_api_key(
    header_key: str | None,
    query_key: str | None,
) -> str:
    api_key = header_key or query_key
    if not api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API key")
    return api_key


async def validate_service_api_key(
    header_key: str | None = Security(api_key_header),
    query_key: str | None = Security(api_key_query),
) -> str:
    """Validate that the API key exists in the configured service API keys list."""

    api_key = _resolve_api_key(header_key, query_key)
    if settings.service_api_keys and api_key not in settings.service_api_keys:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid API key")
    return api_key


async def require_user_api_key(
    db: Session = Depends(get_db),
    header_key: str | None = Security(api_key_header),
    query_key: str | None = Security(api_key_query),
) -> User:
    """Validate API key belonging to a persisted user."""

    api_key = _resolve_api_key(header_key, query_key)
    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid API key")
    return user
