"""Aggregate FastAPI routers for the application."""

from fastapi import APIRouter

from app.api.routes import auth, data, hardware, health, services, system

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])  # /health
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(hardware.router, prefix="/hardware", tags=["hardware"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(data.router, prefix="/data", tags=["data"])
