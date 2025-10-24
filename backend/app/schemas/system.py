"""System interaction schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class HealthStatus(BaseModel):
    status: str
    application: str
    database: str
    cache: str
    services: Dict[str, str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CommandRequest(BaseModel):
    command: List[str]
    timeout: Optional[int] = Field(default=30, ge=1)


class CommandResponse(BaseModel):
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: float


class EnvironmentVariableRequest(BaseModel):
    key: str
    value: Optional[str] = None


class EnvironmentVariableResponse(BaseModel):
    key: str
    value: Optional[str]


class FileSystemOperationRequest(BaseModel):
    path: str


class FileSystemOperationResponse(BaseModel):
    path: str
    entries: List[str]
