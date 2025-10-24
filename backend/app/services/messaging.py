"""Messaging facilities for internal pub/sub communication."""

from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from typing import AsyncIterator, Optional

import structlog
from redis import asyncio as aioredis
from redis.asyncio import Redis

logger = structlog.get_logger(__name__)


class MessageBroker(ABC):
    """Abstract message broker interface."""

    @abstractmethod
    async def publish(self, message: str) -> None:  # pragma: no cover - interface method
        """Publish a message to subscribers."""

    @abstractmethod
    async def subscribe(self) -> AsyncIterator[str]:  # pragma: no cover - interface method
        """Return an async iterator over messages from the broker."""

    @abstractmethod
    async def close(self) -> None:  # pragma: no cover - interface method
        """Close broker connections."""


class RedisMessageBroker(MessageBroker):
    """Redis-based pub/sub broker."""

    def __init__(self, url: str, channel: str = "events") -> None:
        self._url = url
        self._channel = channel
        self._client: Optional[Redis] = None
        self._pubsub: Optional[aioredis.client.PubSub] = None
        self._lock = asyncio.Lock()

    async def connect(self) -> None:
        try:
            self._client = aioredis.from_url(self._url, decode_responses=True)
            self._pubsub = self._client.pubsub()
            await self._pubsub.subscribe(self._channel)
            logger.info("message_broker.redis.connected", channel=self._channel)
        except Exception as exc:  # pragma: no cover - requires redis
            self._client = None
            self._pubsub = None
            logger.warning("message_broker.redis.unavailable", error=str(exc))

    async def publish(self, message: str) -> None:
        if not self._client:
            logger.warning("message_broker.redis.publish_skipped", message=message)
            return
        await self._client.publish(self._channel, message)

    async def subscribe(self) -> AsyncIterator[str]:  # pragma: no cover - integration heavy
        if not self._pubsub:
            raise RuntimeError("Message broker not available")
        while True:
            message = await self._pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and message.get("type") == "message":
                yield str(message.get("data"))

    async def close(self) -> None:
        if self._pubsub is not None:
            await self._pubsub.unsubscribe(self._channel)
            await self._pubsub.close()
            self._pubsub = None
        if self._client is not None:
            await self._client.close()
            self._client = None
