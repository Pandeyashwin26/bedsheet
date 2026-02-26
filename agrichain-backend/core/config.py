"""
AGRI-मित्र Backend Configuration
═══════════════════════════════════════════════════════════════════════════════

Centralized settings management using Pydantic Settings.
All configuration is loaded from environment variables with sensible defaults.
"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Environment ──────────────────────────────────────────────────────────
    environment: str = Field(default="development", alias="NODE_ENV")
    debug: bool = Field(default=False)

    # ─── Server ───────────────────────────────────────────────────────────────
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)
    workers: int = Field(default=1)

    # ─── CORS ─────────────────────────────────────────────────────────────────
    cors_origins: str = Field(default="*")

    # ─── Database ─────────────────────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql://agrimitra:agrimitra@localhost:5432/agrimitra"
    )
    db_pool_size: int = Field(default=5)
    db_max_overflow: int = Field(default=10)

    # ─── External APIs ────────────────────────────────────────────────────────
    openweather_api_key: Optional[str] = Field(default=None)
    datagov_api_key: Optional[str] = Field(default=None)
    google_api_key: Optional[str] = Field(default=None)
    hf_token: Optional[str] = Field(default=None)

    # ─── ETL Scheduling ───────────────────────────────────────────────────────
    etl_enabled: bool = Field(default=True)
    etl_mandi_cron_hour: int = Field(default=0)
    etl_mandi_cron_minute: int = Field(default=30)
    etl_weather_cron_hour: int = Field(default=1)
    etl_weather_cron_minute: int = Field(default=30)

    # ─── Security ─────────────────────────────────────────────────────────────
    secret_key: str = Field(default="dev-secret-key-change-in-production")
    rate_limit_requests: int = Field(default=60)
    rate_limit_window_seconds: int = Field(default=60)

    # ─── Logging ──────────────────────────────────────────────────────────────
    log_level: str = Field(default="INFO")
    log_json_format: bool = Field(default=False)

    # ─── Caching ──────────────────────────────────────────────────────────────
    weather_cache_ttl: int = Field(default=21600)  # 6 hours
    mandi_cache_ttl: int = Field(default=21600)  # 6 hours
    schemes_cache_ttl: int = Field(default=86400)  # 24 hours

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        if self.cors_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() in ("development", "dev", "local")

    def get_api_status(self) -> dict:
        """Return status of configured external APIs."""
        return {
            "weather": "active" if self.openweather_api_key else "fallback",
            "mandi": "active" if self.datagov_api_key else "fallback",
            "gemini": "active" if self.google_api_key else "disabled",
            "disease_scan": "active" if self.hf_token else "disabled",
        }


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Convenience export
settings = get_settings()
