"""Schemas describing hardware control payloads."""

from __future__ import annotations

from typing import Dict, Optional

from pydantic import BaseModel, Field


class HardwareConnectRequest(BaseModel):
    device_id: str
    adapter: str = Field(default="mock")


class HardwareCommandRequest(BaseModel):
    device_id: str
    command: str
    payload: Optional[Dict[str, str]] = None


class HardwareStatusResponse(BaseModel):
    device_id: str
    status: str
    last_command: Optional[str] = None
    telemetry: Dict[str, str] = Field(default_factory=dict)
