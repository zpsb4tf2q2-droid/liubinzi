"""HTTP client with retry and basic rate limiting."""

from __future__ import annotations

import asyncio
from typing import Any, Dict, Optional

import httpx
import structlog
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential

logger = structlog.get_logger(__name__)


class HTTPClient:
    """Reusable asynchronous HTTP client with retries and simple rate limiting."""

    def __init__(
        self,
        timeout: float = 10.0,
        retries: int = 3,
        rate_limit: int = 5,
        period: float = 1.0,
    ) -> None:
        self._client = httpx.AsyncClient(timeout=timeout)
        self._retries = retries
        self._period = period
        self._semaphore = asyncio.BoundedSemaphore(rate_limit)

    async def request(
        self,
        method: str,
        url: str,
        *,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        json: Any = None,
        data: Any = None,
        timeout: Optional[float] = None,
    ) -> httpx.Response:
        """Execute an HTTP request with retry semantics."""

        loop = asyncio.get_running_loop()
        await self._semaphore.acquire()
        try:
            async for attempt in AsyncRetrying(
                stop=stop_after_attempt(self._retries),
                wait=wait_exponential(multiplier=0.5, min=0.5, max=5),
                retry=retry_if_exception_type(httpx.TransportError),
                reraise=True,
            ):
                with attempt:
                    response = await self._client.request(
                        method,
                        url,
                        headers=headers,
                        params=params,
                        json=json,
                        data=data,
                        timeout=timeout,
                    )
                    response.raise_for_status()
                    return response
        finally:
            loop.call_later(self._period, self._semaphore.release)

    async def get(self, url: str, **kwargs: Any) -> httpx.Response:
        return await self.request("GET", url, **kwargs)

    async def post(self, url: str, **kwargs: Any) -> httpx.Response:
        return await self.request("POST", url, **kwargs)

    async def close(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "HTTPClient":
        return self

    async def __aexit__(self, *exc_info: Any) -> None:
        await self.close()
