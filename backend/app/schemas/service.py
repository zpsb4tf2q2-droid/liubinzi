"""Schemas for service discovery and inter-service communication."""

from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, HttpUrl


class ServiceRegistrationRequest(BaseModel):
    name: str
    url: HttpUrl


class ServiceInfo(BaseModel):
    name: str
    url: HttpUrl


class ServiceProxyRequest(BaseModel):
    method: str = "GET"
    path: str = "/"
    payload: Optional[Dict[str, Any]] = None
    headers: Optional[Dict[str, str]] = None
    query: Optional[Dict[str, Any]] = None
