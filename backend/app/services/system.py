"""System interaction helpers."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path
from typing import List, Tuple

import structlog

logger = structlog.get_logger(__name__)


async def run_command(command: List[str], timeout: int = 30) -> Tuple[int, str, str, float]:
    """Execute a system command asynchronously."""

    start = asyncio.get_running_loop().time()
    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout_bytes, stderr_bytes = await asyncio.wait_for(process.communicate(), timeout=timeout)
    except asyncio.TimeoutError as exc:
        process.kill()
        await process.communicate()
        logger.warning("system.command.timeout", command=command, timeout=timeout)
        raise exc

    duration_ms = (asyncio.get_running_loop().time() - start) * 1000
    stdout = stdout_bytes.decode().strip()
    stderr = stderr_bytes.decode().strip()
    logger.info(
        "system.command.completed",
        command=command,
        exit_code=process.returncode,
        duration_ms=round(duration_ms, 2),
    )
    return process.returncode, stdout, stderr, round(duration_ms, 2)


def read_environment_variable(key: str) -> str | None:
    return os.environ.get(key)


def set_environment_variable(key: str, value: str | None) -> None:
    if value is None:
        os.environ.pop(key, None)
    else:
        os.environ[key] = value


def list_directory(path: str) -> List[str]:
    directory = Path(path).expanduser().resolve()
    if not directory.exists():
        raise FileNotFoundError(f"Path not found: {directory}")
    return sorted(item.name for item in directory.iterdir())
