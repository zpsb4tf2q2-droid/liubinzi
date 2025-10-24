"""Operating system interaction endpoints."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.system import (
    CommandRequest,
    CommandResponse,
    EnvironmentVariableRequest,
    EnvironmentVariableResponse,
    FileSystemOperationResponse,
)
from app.services.system import (
    list_directory,
    read_environment_variable,
    run_command,
    set_environment_variable,
)

router = APIRouter()


@router.post("/command", response_model=CommandResponse)
async def execute_command(payload: CommandRequest) -> CommandResponse:
    try:
        exit_code, stdout, stderr, duration = await run_command(payload.command, payload.timeout or 30)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except asyncio.TimeoutError:
        raise HTTPException(status_code=408, detail="Command timed out")
    return CommandResponse(exit_code=exit_code, stdout=stdout, stderr=stderr, duration_ms=duration)


@router.get("/env/{key}", response_model=EnvironmentVariableResponse)
async def get_environment_variable(key: str) -> EnvironmentVariableResponse:
    value = read_environment_variable(key)
    return EnvironmentVariableResponse(key=key, value=value)


@router.post("/env", response_model=EnvironmentVariableResponse)
async def set_environment_variable_endpoint(payload: EnvironmentVariableRequest) -> EnvironmentVariableResponse:
    set_environment_variable(payload.key, payload.value)
    return EnvironmentVariableResponse(key=payload.key, value=payload.value)


@router.get("/filesystem", response_model=FileSystemOperationResponse)
async def list_files(path: str = Query(".")) -> FileSystemOperationResponse:
    try:
        entries = list_directory(path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return FileSystemOperationResponse(path=path, entries=entries)
