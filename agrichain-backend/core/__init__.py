"""
AgriChain Core Module
═══════════════════════════════════════════════════════════════════════════════

Core functionality including configuration, logging, error handling,
and middleware.
"""

from core.config import Settings, get_settings, settings
from core.exceptions import (
    AgriChainException,
    ExternalAPIError,
    NotFoundError,
    RateLimitExceededError,
    ServiceUnavailableError,
    ValidationError,
    register_exception_handlers,
)
from core.logging import get_logger, logger, setup_logging
from core.middleware import setup_middleware

__all__ = [
    # Config
    "Settings",
    "get_settings",
    "settings",
    # Logging
    "get_logger",
    "logger",
    "setup_logging",
    # Exceptions
    "AgriChainException",
    "ExternalAPIError",
    "NotFoundError",
    "RateLimitExceededError",
    "ServiceUnavailableError",
    "ValidationError",
    "register_exception_handlers",
    # Middleware
    "setup_middleware",
]
