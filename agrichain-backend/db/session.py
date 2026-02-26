"""
AGRI-मित्र Database Session Management
═══════════════════════════════════════════════════════════════════════════════

SQLAlchemy engine, session factory, and dependency injection for FastAPI.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from typing import Generator

from core.config import settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""
    pass


# Build database URL from settings
_is_sqlite = settings.database_url.startswith("sqlite")

_engine_kwargs = {
    "echo": settings.is_development,
}

if _is_sqlite:
    # SQLite doesn't support pool_size / max_overflow; use WAL for concurrency
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    _engine_kwargs.update({
        "pool_size": settings.db_pool_size,
        "max_overflow": settings.db_max_overflow,
        "pool_pre_ping": True,
        "pool_recycle": 3600,
    })

engine = create_engine(settings.database_url, **_engine_kwargs)

# Enable WAL mode and foreign keys for SQLite
if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a DB session and closes after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Called at startup."""
    from db.models import (
        MandiPrice, WeatherRecord, SoilProfile,
        NDVIRecord, CropMeta, TransportRoute, PredictionLog,
    )
    Base.metadata.create_all(bind=engine)
