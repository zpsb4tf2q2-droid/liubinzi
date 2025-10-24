"""User domain model."""

from __future__ import annotations

import secrets
from datetime import datetime
from typing import List

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class User(Base):
    """ORM representation of a system user."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    roles: Mapped[str] = mapped_column(String(255), default="user")
    api_key: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def ensure_api_key(self) -> str:
        """Return an API key for the user, generating one if missing."""

        if not self.api_key:
            self.api_key = secrets.token_urlsafe(32)
        return self.api_key

    @property
    def roles_list(self) -> List[str]:
        """Return the user's roles as a list of strings."""

        if not self.roles:
            return []
        return [role.strip() for role in self.roles.split(",") if role.strip()]
