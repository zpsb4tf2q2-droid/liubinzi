"""Application configuration utilities based on environment variables."""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Any, Dict, List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_prefix="FASTAPI_",
        env_ignore_empty=True,
        extra="ignore",
    )

    project_name: str = "Hardware Control Service"
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    debug: bool = False

    api_v1_prefix: str = Field(default="/api/v1")
    secret_key: str = Field(default="changeme", min_length=8)
    access_token_expire_minutes: int = 60
    algorithm: str = Field(default="HS256")

    database_url: str = Field(default="sqlite:///./hardware_control.db")
    redis_url: str = Field(default="redis://localhost:6379/0")

    backend_cors_origins: List[str] = Field(default_factory=lambda: ["*"])
    service_api_keys: List[str] = Field(default_factory=list)

    service_registry_endpoints: Dict[str, str] = Field(default_factory=dict)

    http_client_timeout: float = 10.0
    http_client_retries: int = 3
    http_rate_limit: int = Field(default=5, ge=1)
    http_rate_period_seconds: float = Field(default=1.0, gt=0)

    log_level: str = Field(default="INFO")

    message_broker_enabled: bool = False
    message_broker_channel: str = Field(default="hardware-events")

    hardware_default_adapter: str = Field(default="mock")

    external_api_base_url: Optional[str] = None

    class Config:
        """pydantic v1 compatibility shim (kept for IDEs)."""

        arbitrary_types_allowed = True

    @field_validator("backend_cors_origins", "service_api_keys", mode="before")
    @classmethod
    def _split_str_values(cls, value: Any) -> List[str]:
        if isinstance(value, str):
            value = value.split(",")
        if isinstance(value, list):
            return [item.strip() for item in value if item and item.strip()]
        return []

    @field_validator("service_registry_endpoints", mode="before")
    @classmethod
    def _parse_registry(cls, value: Any) -> Dict[str, str]:
        if value in (None, "", {}):
            return {}
        if isinstance(value, dict):
            return value
        if isinstance(value, str):
            try:
                data = json.loads(value)
                if isinstance(data, dict):
                    return {str(k): str(v) for k, v in data.items()}
            except json.JSONDecodeError:
                pairs: Dict[str, str] = {}
                for item in value.split(","):
                    if "=" in item:
                        name, url = item.split("=", 1)
                        pairs[name.strip()] = url.strip()
                if pairs:
                    return pairs
        raise ValueError(f"Cannot parse service registry endpoints from value: {value!r}")


@lru_cache()
def get_settings() -> Settings:
    """Return a cached settings instance."""

    return Settings()


settings = get_settings()
