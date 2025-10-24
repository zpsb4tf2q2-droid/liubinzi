"""Hardware control endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_message_broker
from app.core.config import settings
from app.schemas.hardware import (
    HardwareCommandRequest,
    HardwareConnectRequest,
    HardwareStatusResponse,
)
from app.services.hardware import HardwareError, available_adapters, get_adapter
from app.services.messaging import MessageBroker

router = APIRouter()


@router.get("/adapters", response_model=dict)
async def list_hardware_adapters() -> dict:
    return {name: adapter.__class__.__name__ for name, adapter in available_adapters().items()}


@router.post("/connect", response_model=HardwareStatusResponse)
async def connect_device(payload: HardwareConnectRequest) -> HardwareStatusResponse:
    try:
        adapter = get_adapter(payload.adapter or settings.hardware_default_adapter)
        await adapter.connect(payload.device_id)
        status = await adapter.status(payload.device_id)
    except HardwareError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return HardwareStatusResponse(**status)


@router.post("/command", response_model=dict)
async def send_command(
    payload: HardwareCommandRequest,
    broker: MessageBroker | None = Depends(get_message_broker),
) -> dict:
    try:
        adapter = get_adapter(settings.hardware_default_adapter)
        result = await adapter.send_command(payload.device_id, payload.command, payload.payload)
    except HardwareError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if broker is not None:
        await broker.publish(f"{payload.device_id}:{payload.command}")
    return result


@router.get("/{device_id}", response_model=HardwareStatusResponse)
async def get_device_status(device_id: str) -> HardwareStatusResponse:
    try:
        adapter = get_adapter(settings.hardware_default_adapter)
        status = await adapter.status(device_id)
    except HardwareError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return HardwareStatusResponse(**status)
