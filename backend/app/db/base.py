"""Base metadata import for Alembic migrations."""

from app.db.base_class import Base  # noqa: F401

# Import all models here for Alembic's autogeneration
from app.models.user import User  # noqa: F401,E402
