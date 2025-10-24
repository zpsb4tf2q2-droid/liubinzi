"""Authentication and user management helpers."""

from __future__ import annotations

import secrets
from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.security.password import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_in: UserCreate, is_superuser: bool = False) -> User:
    hashed_password = get_password_hash(user_in.password)
    roles = ",".join(user_in.roles) if user_in.roles else "user"
    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        roles=roles,
        is_superuser=is_superuser,
        is_active=user_in.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.roles is not None:
        user.roles = ",".join(user_in.roles)
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_api_key_for_user(db: Session, user: User) -> str:
    api_key = user.ensure_api_key()
    db.add(user)
    db.commit()
    db.refresh(user)
    return api_key
