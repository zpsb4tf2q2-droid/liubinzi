"""Simple in-memory service registry."""

from __future__ import annotations

import asyncio
from typing import Dict, Optional

import structlog

logger = structlog.get_logger(__name__)


class ServiceRegistry:
    """Track service endpoints for intra-service communication."""

    def __init__(self, initial_services: Optional[Dict[str, str]] = None) -> None:
        self._services: Dict[str, str] = initial_services.copy() if initial_services else {}
        self._lock = asyncio.Lock()

    async def register(self, name: str, url: str) -> None:
        async with self._lock:
            self._services[name] = url
            logger.info("service_registry.registered", name=name, url=url)

    async def deregister(self, name: str) -> None:
        async with self._lock:
            if name in self._services:
                self._services.pop(name)
                logger.info("service_registry.deregistered", name=name)

    async def get(self, name: str) -> Optional[str]:
        async with self._lock:
            return self._services.get(name)

    async def list(self) -> Dict[str, str]:
        async with self._lock:
            return self._services.copy()
