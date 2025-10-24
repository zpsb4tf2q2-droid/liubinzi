"""Common pytest fixtures for backend tests."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient

# Configure environment before importing application modules
os.environ.setdefault("FASTAPI_SECRET_KEY", "test-secret-key-please-change")
os.environ.setdefault("FASTAPI_DATABASE_URL", "sqlite:///./test_backend.db")
os.environ.setdefault("FASTAPI_SERVICE_API_KEYS", "test-service-key")
os.environ.setdefault("FASTAPI_BACKEND_CORS_ORIGINS", "*")

from app.db.base import Base  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.main import create_app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def setup_database() -> Generator[None, None, None]:
    db_file = Path("test_backend.db")
    if db_file.exists():
        db_file.unlink()
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if db_file.exists():
        db_file.unlink()


@pytest.fixture(scope="session")
def app_fixture():
    return create_app()


@pytest.fixture()
def client(app_fixture) -> Generator[TestClient, None, None]:
    with TestClient(app_fixture) as client:
        yield client


@pytest.fixture()
def db_session() -> Generator:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
