"""Authentication related endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_current_superuser, get_db_session
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.security.jwt import create_access_token
from app.services.authentication import (
    authenticate_user,
    create_api_key_for_user,
    create_user,
    get_user_by_email,
    update_user,
)

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserCreate,
    db: Session = Depends(get_db_session),
) -> UserRead:
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = create_user(db, payload)
    return UserRead.model_validate(user)


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db_session),
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token(subject=user.id)
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: User = Depends(get_current_active_user)) -> UserRead:
    return UserRead.model_validate(current_user)


@router.post("/me/api-key", response_model=dict)
async def generate_api_key(
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db_session),
) -> dict:
    api_key = create_api_key_for_user(db, current_user)
    return {"api_key": api_key}


@router.patch("/me", response_model=UserRead)
async def update_current_user(
    payload: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session),
) -> UserRead:
    updated_user = update_user(db, current_user, payload)
    return UserRead.model_validate(updated_user)
