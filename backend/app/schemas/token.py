"""Token response and payload schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    sub: str | None = None
    exp: int | None = None
