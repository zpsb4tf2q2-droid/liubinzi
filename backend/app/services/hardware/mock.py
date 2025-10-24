"""Mock hardware adapter used for development and testing."""

from __future__ import annotations

import asyncio
from typing import Dict, Optional

import structlog

from app.services.hardware.base import HardwareAdapter, HardwareError

logger = structlog.get_logger(__name__)


class MockHardwareAdapter(HardwareAdapter):
    def __init__(self) -> None:
        self._connected_devices: Dict[str, Dict[str, str]] = {}
        self._last_commands: Dict[str, str] = {}

    async def connect(self, device_id: str) -> Dict[str, str]:
        await asyncio.sleep(0.1)
        self._connected_devices[device_id] = {"status": "connected"}
        logger.info("hardware.mock.connect", device_id=device_id)
        return {"device_id": device_id, "status": "connected"}

    async def send_command(
        self,
        device_id: str,
        command: str,
        payload: Optional[Dict[str, str]] = None,
    ) -> Dict[str, str]:
        await asyncio.sleep(0.1)
        if device_id not in self._connected_devices:
            raise HardwareError(f"Device {device_id} is not connected")
        self._last_commands[device_id] = command
        response = {
            "device_id": device_id,
            "command": command,
            "status": "executed",
            "payload": payload or {},
        }
        logger.info("hardware.mock.command", **response)
        return response

    async def status(self, device_id: str) -> Dict[str, str]:
        device = self._connected_devices.get(device_id, {"status": "disconnected"})
        last_command = self._last_commands.get(device_id)
        telemetry = {"temperature": "42C", "voltage": "5V"} if device_id in self._connected_devices else {}
        return {
            "device_id": device_id,
            "status": device.get("status", "unknown"),
            "last_command": last_command,
            "telemetry": telemetry,
        }
