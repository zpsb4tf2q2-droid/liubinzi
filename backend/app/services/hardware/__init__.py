"""Hardware service utilities."""

from __future__ import annotations

from app.services.hardware.base import HardwareAdapter, HardwareError, HardwareRegistry
from app.services.hardware.mock import MockHardwareAdapter

_registry = HardwareRegistry()
_registry.register("mock", MockHardwareAdapter())


def get_adapter(name: str = "mock") -> HardwareAdapter:
    """Return a hardware adapter by name."""

    return _registry.get(name)


def available_adapters() -> dict[str, HardwareAdapter]:
    return _registry.list()
