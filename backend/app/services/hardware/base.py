"""Base abstractions for hardware controllers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict


class HardwareAdapter(ABC):
    """Interface each hardware driver must implement."""

    @abstractmethod
    async def connect(self, device_id: str) -> Dict[str, str]:  # pragma: no cover - interface
        """Connect to the given device and return metadata."""

    @abstractmethod
    async def send_command(self, device_id: str, command: str, payload: Dict[str, str] | None = None) -> Dict[str, str]:  # pragma: no cover - interface
        """Send a command to the hardware and return its response."""

    @abstractmethod
    async def status(self, device_id: str) -> Dict[str, str]:  # pragma: no cover - interface
        """Return the current device status."""


class HardwareError(RuntimeError):
    """Raised when hardware operations fail."""


class HardwareRegistry:
    """Registry managing available adapters."""

    def __init__(self) -> None:
        self._adapters: Dict[str, HardwareAdapter] = {}

    def register(self, name: str, adapter: HardwareAdapter) -> None:
        self._adapters[name] = adapter

    def get(self, name: str) -> HardwareAdapter:
        try:
            return self._adapters[name]
        except KeyError as exc:  # pragma: no cover - defensive guard
            raise HardwareError(f"No adapter registered for '{name}'") from exc

    def list(self) -> Dict[str, HardwareAdapter]:
        return self._adapters.copy()
