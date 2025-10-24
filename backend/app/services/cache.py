"""Caching abstraction backed by Redis with in-memory fallback."""

from __future__ import annotations

import asyncio
from typing import Any, Dict, Optional

import structlog
from redis import asyncio as aioredis
from redis.asyncio import Redis

logger = structlog.get_logger(__name__)


class RedisCache:
    """Thin wrapper around redis-py providing async helpers and graceful degradation."""

    def __init__(self, url: str) -> None:
        self._url = url
        self._client: Optional[Redis] = None
        self._memory_cache: Dict[str, Any] = {}
        self._lock = asyncio.Lock()
        self.is_available = False

    async def connect(self) -> None:
        """Connect to Redis, falling back to an in-memory store if unavailable."""

        try:
            self._client = aioredis.from_url(self._url, decode_responses=True)
            await self._client.ping()
            self.is_available = True
            logger.info("cache.redis.connected", url=self._url)
        except Exception as exc:  # pragma: no cover - depends on external service
            self._client = None
            self.is_available = False
            logger.warning("cache.redis.unavailable", error=str(exc))

    async def close(self) -> None:
        """Close the Redis connection if active."""

        if self._client is not None:
            await self._client.close()
            self._client = None
        self.is_available = False

    async def ping(self) -> bool:
        """Return True if the cache backend responds to a ping."""

        if self._client is None:
            return False
        try:
            await self._client.ping()
            return True
        except Exception:  # pragma: no cover - depends on external service
            return False

    async def get(self, key: str) -> Any:
        """Fetch a cached value."""

        if self._client is None:
            return self._memory_cache.get(key)
        return await self._client.get(key)

    async def set(self, key: str, value: Any, expire_seconds: Optional[int] = None) -> None:
        """Store a value in the cache."""

        if self._client is None:
            async with self._lock:
                self._memory_cache[key] = value
            return
        await self._client.set(key, value, ex=expire_seconds)

    async def delete(self, key: str) -> None:
        """Delete a cached value."""

        if self._client is None:
            async with self._lock:
                self._memory_cache.pop(key, None)
            return
        await self._client.delete(key)
