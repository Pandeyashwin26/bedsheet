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


class AriaMemory(Base):
    """
    ARIA 2.0 Persistent Memory —
    Stores facts, preferences, emotional signals, and milestones
    extracted from conversations so ARIA can recall context across sessions.
    """
    __tablename__ = "aria_memories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    memory_type = Column(
        String(30), nullable=False, index=True,
    )  # fact | preference | emotion | milestone
    memory_key = Column(String(200), nullable=False)
    memory_value = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)       # 0.0 – 1.0
    source = Column(String(50), default="conversation")  # conversation | system | user_edit
    last_referenced = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index("ix_aria_mem_user_type", "user_id", "memory_type"),
        UniqueConstraint("user_id", "memory_type", "memory_key",
                         name="uq_aria_memory"),
    )


class AriaConversation(Base):
    """
    ARIA 2.0 Conversation Log —
    Stores full conversation turns for audit, analytics, and context window.
    """
    __tablename__ = "aria_conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    role = Column(String(20), nullable=False)            # user | assistant | tool
    content = Column(Text, nullable=False)
    emotion = Column(String(30), nullable=True)          # detected emotion tag
    tool_calls = Column(Text, nullable=True)             # JSON: list of tool invocations
    tokens_used = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_aria_conv_user_session", "user_id", "session_id"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# F1 — Crop Digital Twin
# ═══════════════════════════════════════════════════════════════════════════════


class CropSimulation(Base):
    """Virtual crop simulation model per field/user."""
    __tablename__ = "crop_simulations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    crop = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    sowing_date = Column(Date, nullable=False)
    current_stage = Column(String(50), default="seedling")  # seedling|vegetative|flowering|maturity
    health_score = Column(Float, default=0.85)  # 0-1
    growth_day = Column(Integer, default=0)
    simulated_yield_kg = Column(Float, nullable=True)
    irrigation_log = Column(Text, nullable=True)  # JSON array
    weather_impact = Column(Text, nullable=True)  # JSON
    whatif_results = Column(Text, nullable=True)  # JSON: last what-if query result
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_sim_user_crop", "user_id", "crop"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# F4 — Post-Harvest Loss Counterfactual Engine
# ═══════════════════════════════════════════════════════════════════════════════


class HarvestCycle(Base):
    """Completed harvest cycle for counterfactual analysis."""
    __tablename__ = "harvest_cycles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    crop = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    sowing_date = Column(Date, nullable=True)
    harvest_date = Column(Date, nullable=False)
    sale_date = Column(Date, nullable=True)
    sale_mandi = Column(String(200), nullable=True)
    quantity_quintals = Column(Float, nullable=True)
    sale_price_per_quintal = Column(Float, nullable=True)
    total_revenue = Column(Float, nullable=True)
    optimal_harvest_date = Column(Date, nullable=True)  # what model recommended
    optimal_price = Column(Float, nullable=True)         # what could have been
    loss_amount = Column(Float, nullable=True)           # actual vs optimal
    loss_reason = Column(Text, nullable=True)            # JSON explanation
    lesson_summary = Column(Text, nullable=True)         # human-readable lesson
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_harvest_user_crop", "user_id", "crop"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# F6 — Krishak Network (Crowd Intelligence)
# ═══════════════════════════════════════════════════════════════════════════════


class CrowdOutcome(Base):
    """Anonymized harvest outcomes for crowd intelligence."""
    __tablename__ = "crowd_outcomes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district = Column(String(100), nullable=False, index=True)
    crop = Column(String(100), nullable=False, index=True)
    harvest_week = Column(String(10), nullable=False)  # e.g. "2026-W09"
    sale_price_per_quintal = Column(Float, nullable=False)
    quantity_quintals = Column(Float, nullable=True)
    days_waited_after_ready = Column(Integer, nullable=True)
    outcome_label = Column(String(30), nullable=True)  # good|average|poor
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_crowd_district_crop_week", "district", "crop", "harvest_week"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# F8 — Village Champion System
# ═══════════════════════════════════════════════════════════════════════════════


class ChampionScore(Base):
    """Monthly leaderboard scores per farmer."""
    __tablename__ = "champion_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    month = Column(String(7), nullable=False)  # "2026-02"
    yield_accuracy_score = Column(Float, default=0.0)
    price_achievement_score = Column(Float, default=0.0)
    app_contribution_score = Column(Float, default=0.0)
    total_score = Column(Float, default=0.0)
    rank = Column(Integer, nullable=True)
    badge = Column(String(50), nullable=True)  # gold|silver|bronze|none
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "month", name="uq_champion_user_month"),
        Index("ix_champion_district_month", "district", "month"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# F9 — Crop Diary (Voice-First Field Journal)
# ═══════════════════════════════════════════════════════════════════════════════


class CropDiaryEntry(Base):
    """Weekly voice/text field journal entries."""
    __tablename__ = "crop_diary_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    crop = Column(String(100), nullable=True)
    entry_date = Column(Date, nullable=False, index=True)
    text_content = Column(Text, nullable=False)
    audio_uri = Column(Text, nullable=True)  # local path to audio recording
    tags = Column(Text, nullable=True)  # JSON: ["weather", "pest", "irrigation"]
    season = Column(String(20), nullable=True)  # kharif|rabi|zaid
    sentiment = Column(String(20), nullable=True)  # positive|neutral|negative
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_diary_user_date", "user_id", "entry_date"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# F10 — Krishi Credit Score
# ═══════════════════════════════════════════════════════════════════════════════


class KrishiScore(Base):
    """Computed credit-like score per farmer (0-850)."""
    __tablename__ = "krishi_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    score = Column(Integer, default=500)
    harvest_consistency = Column(Float, default=0.0)
    market_timing = Column(Float, default=0.0)
    soil_health_trend = Column(Float, default=0.0)
    yield_history = Column(Float, default=0.0)
    app_engagement = Column(Float, default=0.0)
    breakdown = Column(Text, nullable=True)  # JSON full breakdown
    computed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_krishi_user", "user_id"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# F11 — Input Marketplace
# ═══════════════════════════════════════════════════════════════════════════════


class InputProduct(Base):
    """Agricultural input products (fertilizers, pesticides, seeds)."""
    __tablename__ = "input_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, index=True)  # fertilizer|pesticide|seed|tool
    brand = Column(String(100), nullable=True)
    price_inr = Column(Float, nullable=False)
    unit = Column(String(30), nullable=True)  # kg, litre, packet
    quantity_per_acre = Column(String(50), nullable=True)
    target_diseases = Column(Text, nullable=True)  # JSON list of disease names
    target_deficiencies = Column(Text, nullable=True)  # JSON: N, P, K
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class LocalShop(Base):
    """Agri input shops in Maharashtra."""
    __tablename__ = "local_shops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    address = Column(Text, nullable=True)
    phone = Column(String(15), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    products_available = Column(Text, nullable=True)  # JSON list of product IDs
    rating = Column(Float, default=4.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ═══════════════════════════════════════════════════════════════════════════════
# F13 — B2B Bulk Buyer Connect
# ═══════════════════════════════════════════════════════════════════════════════


class BuyerOrder(Base):
    """Advance purchase orders from bulk buyers."""
    __tablename__ = "buyer_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    buyer_name = Column(String(200), nullable=False)
    buyer_type = Column(String(50), nullable=True)  # processor|exporter|retailer
    crop = Column(String(100), nullable=False, index=True)
    quantity_quintals = Column(Float, nullable=False)
    grade = Column(String(50), nullable=True)
    price_per_quintal = Column(Float, nullable=False)
    delivery_window_start = Column(Date, nullable=True)
    delivery_window_end = Column(Date, nullable=True)
    district = Column(String(100), nullable=True, index=True)
    status = Column(String(30), default="open")  # open|fulfilled|expired
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_buyer_crop_status", "crop", "status"),
    )


class FarmerExpression(Base):
    """Farmer interest expressions for buyer orders."""
    __tablename__ = "farmer_expressions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    buyer_order_id = Column(Integer, nullable=False, index=True)
    quantity_offered = Column(Float, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String(30), default="pending")  # pending|accepted|rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "buyer_order_id", name="uq_farmer_expression"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# F17 — Cold Storage Monitor (IoT)
# ═══════════════════════════════════════════════════════════════════════════════


class StorageReading(Base):
    """Temperature + humidity readings from cold storage sensors."""
    __tablename__ = "storage_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    device_id = Column(String(100), nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    crop = Column(String(100), nullable=True)
    alert_triggered = Column(Boolean, default=False)
    reading_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_storage_user_device", "user_id", "device_id"),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Blockchain Trust Layer — On-Chain Proofs, Trades & Settlements
# ═══════════════════════════════════════════════════════════════════════════════


class ProofRecord(Base):
    """On-chain recommendation proof anchored to Polygon."""
    __tablename__ = "proof_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    crop = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    input_hash = Column(String(66), nullable=False)         # keccak256 of input data
    output_hash = Column(String(66), nullable=False)        # keccak256 of recommendation
    model_version = Column(String(50), nullable=False)
    tx_hash = Column(String(66), nullable=True, unique=True)  # Polygon tx hash
    block_number = Column(Integer, nullable=True)
    status = Column(String(20), default="pending")          # pending|confirmed|failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_proof_user_crop", "user_id", "crop"),
    )


class TradeRecord(Base):
    """On-chain trade agreement between farmer & buyer."""
    __tablename__ = "trade_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    seller_id = Column(Integer, nullable=False, index=True)
    buyer_id = Column(Integer, nullable=False, index=True)
    crop = Column(String(100), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    quality_grade = Column(String(10), nullable=True)       # A|B|C
    delivery_deadline = Column(DateTime, nullable=True)
    penalty_rate = Column(Float, default=0.0)               # 0-100 %
    status = Column(String(30), default="created")          # created|confirmed|delivered|cancelled|disputed
    contract_trade_id = Column(Integer, nullable=True)      # on-chain trade index
    tx_hash = Column(String(66), nullable=True)
    block_number = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_trade_seller_buyer", "seller_id", "buyer_id"),
    )


class SettlementRecord(Base):
    """On-chain escrow settlement for a trade."""
    __tablename__ = "settlement_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trade_id = Column(Integer, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="pending")          # pending|locked|released|refunded|penalized
    escrow_tx_hash = Column(String(66), nullable=True)      # lock tx
    release_tx_hash = Column(String(66), nullable=True)     # release/refund tx
    block_number = Column(Integer, nullable=True)
    penalty_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_settlement_trade", "trade_id"),
    )
