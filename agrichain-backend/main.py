"""
AgriChain Backend — Production FastAPI Application
═══════════════════════════════════════════════════════════════════════════════

AI-powered post-harvest advisory system for Indian farmers.
Provides APIs for harvest timing, mandi prices, spoilage risk,
disease detection, and government schemes.
"""

import sys
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Core modules
from core.config import settings
from core.exceptions import register_exception_handlers
from core.logging import get_logger, setup_logging
from core.middleware import setup_middleware

# Routers
from routers.predict import router as predict_router
from routers.weather import router as weather_router
from routers.market import router as market_router
from routers.disease import router as disease_router
from routers.schemes import router as schemes_router

# Initialize logging
setup_logging()
logger = get_logger("agrichain.main")


# ═══════════════════════════════════════════════════════════════════════════════
# Application Lifespan
# ═══════════════════════════════════════════════════════════════════════════════


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown hooks."""
    logger.info(
        "AgriChain API starting",
        environment=settings.environment,
        host=settings.api_host,
        port=settings.api_port,
    )

    # Log API status
    api_status = settings.get_api_status()
    for service, status in api_status.items():
        emoji = "✅" if status == "active" else "⚠️"
        logger.info(f"   {service.capitalize()}: {emoji} {status}")

    yield

    logger.info("AgriChain API shutting down")


# ═══════════════════════════════════════════════════════════════════════════════
# Application Factory
# ═══════════════════════════════════════════════════════════════════════════════


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title="AgriChain API",
        description=(
            "AI-powered post-harvest advisory system for Indian farmers.\n\n"
            "## Features\n"
            "- 🌾 **Harvest Timing**: Optimal harvest window predictions\n"
            "- 📊 **Mandi Prices**: Real-time market price intelligence\n"
            "- 📦 **Spoilage Risk**: Storage and transit risk assessment\n"
            "- 🔬 **Disease Detection**: AI-powered crop disease scanning\n"
            "- 🏛️ **Government Schemes**: Relevant scheme recommendations\n"
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        openapi_url="/openapi.json" if settings.is_development else "/api/v1/openapi.json",
    )

    # ─── CORS Configuration ───────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # ─── Register Middleware ──────────────────────────────────────────────────
    setup_middleware(app)

    # ─── Register Exception Handlers ──────────────────────────────────────────
    register_exception_handlers(app)

    # ─── Register Routers ─────────────────────────────────────────────────────
    api_prefix = "/api/v1" if settings.is_production else ""

    app.include_router(predict_router, prefix=api_prefix)
    app.include_router(weather_router, prefix=api_prefix)
    app.include_router(market_router, prefix=api_prefix)
    app.include_router(disease_router, prefix=api_prefix)
    app.include_router(schemes_router, prefix=api_prefix)

    return app


# Create application instance
app = create_app()


# ═══════════════════════════════════════════════════════════════════════════════
# Root Endpoints
# ═══════════════════════════════════════════════════════════════════════════════


@app.get("/", tags=["status"])
def root() -> Dict[str, str]:
    """Root endpoint with API information."""
    return {
        "name": "AgriChain API",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.environment,
        "docs": "/docs" if settings.is_development else "disabled",
    }


@app.get("/health", tags=["status"])
def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for monitoring and load balancers.

    Returns service status and configuration state.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "environment": settings.environment,
        "services": settings.get_api_status(),
    }


@app.get("/ready", tags=["status"])
def readiness_check() -> Dict[str, Any]:
    """
    Readiness check for Kubernetes/container orchestration.

    Returns ready status when the application is ready to receive traffic.
    """
    return {
        "ready": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Development Server Entry Point
# ═══════════════════════════════════════════════════════════════════════════════


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.is_development,
        log_level=settings.log_level.lower(),
    )
