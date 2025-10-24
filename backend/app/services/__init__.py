"""Service layer exports."""

from app.services.authentication import (
    authenticate_user,
    create_api_key_for_user,
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user,
)
from app.services.cache import RedisCache
from app.services.data_processing import DataProcessor
from app.services.hardware import available_adapters, get_adapter
from app.services.http_client import HTTPClient
from app.services.messaging import MessageBroker, RedisMessageBroker
from app.services.service_registry import ServiceRegistry
from app.services.system import list_directory, read_environment_variable, run_command, set_environment_variable

__all__ = [
    "authenticate_user",
    "create_api_key_for_user",
    "create_user",
    "get_user_by_email",
    "get_user_by_id",
    "update_user",
    "RedisCache",
    "DataProcessor",
    "available_adapters",
    "get_adapter",
    "HTTPClient",
    "MessageBroker",
    "RedisMessageBroker",
    "ServiceRegistry",
    "list_directory",
    "read_environment_variable",
    "run_command",
    "set_environment_variable",
]
