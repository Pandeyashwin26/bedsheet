"""
AGRI-मित्र Database Models
═══════════════════════════════════════════════════════════════════════════════

SQLAlchemy ORM models for all data entities.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, Float, String, DateTime, Date, Boolean, Text,
    Index, UniqueConstraint,
)
from db.session import Base


class MandiPrice(Base):
    """Historical mandi price records from Agmarknet."""
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    commodity = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    market = Column(String(200), nullable=False, index=True)
    variety = Column(String(100), nullable=True)
    arrival_date = Column(Date, nullable=False, index=True)
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    modal_price = Column(Float, nullable=False)
    arrival_qty_tonnes = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("commodity", "market", "arrival_date", "variety",
                         name="uq_mandi_record"),
        Index("ix_mandi_crop_date", "commodity", "arrival_date"),
        Index("ix_mandi_district_date", "district", "arrival_date"),
    )


class WeatherRecord(Base):
    """Weather data from NASA POWER / OpenWeatherMap."""
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    record_date = Column(Date, nullable=False, index=True)
    temp_min = Column(Float, nullable=True)
    temp_max = Column(Float, nullable=True)
    temp_avg = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)
    solar_radiation = Column(Float, nullable=True)  # MJ/m²/day
    wind_speed = Column(Float, nullable=True)        # m/s
    source = Column(String(50), default="nasa_power")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("district", "record_date", "source", name="uq_weather_record"),
        Index("ix_weather_district_date", "district", "record_date"),
    )


class SoilProfile(Base):
    """Soil health data from Soil Health Card dataset."""
    __tablename__ = "soil_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    block = Column(String(100), nullable=True)
    soil_type = Column(String(100), nullable=True)
    ph = Column(Float, nullable=True)
    organic_carbon_pct = Column(Float, nullable=True)
    nitrogen_kg_ha = Column(Float, nullable=True)     # N
    phosphorus_kg_ha = Column(Float, nullable=True)   # P
    potassium_kg_ha = Column(Float, nullable=True)    # K
    soil_quality_index = Column(Float, nullable=True)  # 0-1 normalized
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_soil_district", "district", "state"),
    )


class NDVIRecord(Base):
    """NDVI vegetation index from Sentinel-2 satellite."""
    __tablename__ = "ndvi_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    district = Column(String(100), nullable=False, index=True)
    record_date = Column(Date, nullable=False, index=True)
    ndvi_value = Column(Float, nullable=False)  # -1 to 1
    ndvi_trend_30d = Column(Float, nullable=True)  # slope over 30 days
    growth_plateau = Column(Boolean, default=False)  # harvest readiness signal
    source = Column(String(50), default="sentinel2")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_ndvi_district_date", "district", "record_date"),
    )


class CropMeta(Base):
    """Crop metadata — maturity, shelf life, FAO loss rates."""
    __tablename__ = "crop_meta"

    id = Column(Integer, primary_key=True, autoincrement=True)
    crop = Column(String(100), nullable=False, unique=True, index=True)
    maturity_days_min = Column(Integer, nullable=False)
    maturity_days_max = Column(Integer, nullable=False)
    shelf_life_days_open = Column(Integer, nullable=False)
    shelf_life_days_cold = Column(Integer, nullable=False)
    optimal_temp_min = Column(Float, nullable=True)
    optimal_temp_max = Column(Float, nullable=True)
    optimal_humidity_min = Column(Float, nullable=True)
    optimal_humidity_max = Column(Float, nullable=True)
    fao_post_harvest_loss_pct = Column(Float, nullable=True)  # FAO loss rate
    base_price_per_quintal = Column(Float, nullable=True)
    category = Column(String(50), nullable=True)  # vegetable, cereal, pulse, etc.


class TransportRoute(Base):
    """Pre-computed transport routes between districts and mandis."""
    __tablename__ = "transport_routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    origin_district = Column(String(100), nullable=False, index=True)
    destination_market = Column(String(200), nullable=False)
    distance_km = Column(Float, nullable=False)
    estimated_time_hours = Column(Float, nullable=True)
    road_quality = Column(String(50), nullable=True)  # good, moderate, poor
    fuel_cost_per_km = Column(Float, default=6.5)
    spoilage_rate_per_hour = Column(Float, nullable=True)  # %/hour

    __table_args__ = (
        UniqueConstraint("origin_district", "destination_market",
                         name="uq_transport_route"),
    )


class User(Base):
    """Registered users of AGRI-मित्र."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    phone = Column(String(15), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), default="Maharashtra")
    main_crop = Column(String(100), nullable=True)
    farm_size_acres = Column(Float, nullable=True)
    soil_type = Column(String(100), nullable=True)
    language = Column(String(5), default="hi")
    is_active = Column(Boolean, default=True)
    total_harvests = Column(Integer, default=0)
    savings_estimate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


class PredictionLog(Base):
    """Audit log for all predictions served."""
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    prediction_type = Column(String(50), nullable=False)  # harvest, mandi, spoilage
    crop = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    input_params = Column(Text, nullable=True)   # JSON string
    output_result = Column(Text, nullable=True)  # JSON string
    confidence = Column(Float, nullable=True)
    model_version = Column(String(50), nullable=True)
    data_sources_used = Column(Text, nullable=True)  # comma-separated
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
