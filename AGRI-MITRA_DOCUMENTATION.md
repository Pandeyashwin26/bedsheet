# 🌾 AGRI-मित्र (Agri-Mitra) — Complete Project Documentation

> **India's AI-Powered Post-Harvest Intelligence Platform for Farmers**

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Frontend — Mobile Application](#4-frontend--mobile-application)
5. [Backend — FastAPI Server](#5-backend--fastapi-server)
6. [AI / ML Models](#6-ai--ml-models)
7. [Database Schema](#7-database-schema)
8. [Authentication System](#8-authentication-system)
9. [Multi-Language System (i18n)](#9-multi-language-system-i18n)
10. [ARIA — AI Voice Assistant](#10-aria--ai-voice-assistant)
11. [ETL Pipelines](#11-etl-pipelines)
12. [Decision Engine & Explainability](#12-decision-engine--explainability)
13. [API Endpoints Reference](#13-api-endpoints-reference)
14. [Seed Data & Demo Accounts](#14-seed-data--demo-accounts)
15. [Setup & Installation](#15-setup--installation)
16. [Project Structure](#16-project-structure)

---

## 1. Project Overview

**AGRI-मित्र** (meaning "Agriculture Friend") is a comprehensive AI-powered mobile application designed to help Indian farmers — particularly in Maharashtra — make data-driven decisions about:

- **When to harvest** — optimal harvest window predictions
- **Where to sell** — mandi (market) price analysis & recommendations  
- **How to reduce losses** — real-time spoilage risk assessment
- **What's wrong with my crop** — AI-powered disease detection
- **Government schemes** — personalized scheme recommendations
- **Weather intelligence** — 7-day forecasts with farming advisories

The platform combines **real-time government data** (data.gov.in mandi prices), **NASA satellite imagery** (NDVI vegetation index), **weather APIs**, and **machine learning models** to deliver actionable, explainable recommendations in **3 languages** (English, Hindi, Marathi).

### Key Differentiators

| Feature | Description |
|---------|-------------|
| **3-Tier Fallback** | Backend API → Client-side ML → Hardcoded defaults (never fails) |
| **Explainable AI** | Every prediction comes with human-readable reasoning |
| **Dual Model Architecture** | v1 (rule-based) + v2 (ML-based) models run in parallel |
| **FAO-Calibrated Data** | Post-harvest loss parameters from UN FAO studies |
| **Offline-First** | Client-side recommendation engine works without internet |
| **Voice-Enabled** | ARIA assistant supports voice commands in Hindi/English/Marathi |

---

## 2. Tech Stack

### Frontend (Mobile App)

| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.83.2 | Cross-platform mobile framework |
| Expo SDK | 55 | Development toolchain |
| React Navigation | v7 | Screen navigation (Stack + Bottom Tabs) |
| Axios | 1.9.0 | HTTP client for API calls |
| AsyncStorage | 2.1.2 | Local data persistence |
| expo-speech | — | Text-to-Speech for ARIA |
| expo-av | — | Audio recording for voice input |
| expo-notifications | — | Push notification support |
| @expo/vector-icons | — | MaterialCommunityIcons |

### Backend (API Server)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.13+ | Runtime |
| FastAPI | 0.115+ | REST API framework |
| SQLAlchemy | 2.0+ | ORM & database toolkit |
| SQLite | 3 | Database (zero-setup) |
| Pydantic | 2.0+ | Data validation & settings |
| scikit-learn | 1.6+ | Machine learning models |
| XGBoost | 2.1+ | Gradient boosting models |
| NumPy / Pandas | — | Data processing |
| python-jose | — | JWT token handling |
| passlib + bcrypt | — | Password hashing |
| APScheduler | 3.10+ | ETL job scheduling |
| structlog | — | Structured logging |
| httpx | — | Async HTTP client (ETL) |
| Alembic | 1.14+ | Database migrations |

### External APIs

| API | Purpose |
|-----|---------|
| data.gov.in | Real-time mandi (market) commodity prices |
| Open-Meteo | Weather forecasts & historical data |
| NASA POWER | Solar radiation & agricultural weather data |
| Sentinel-2 (Copernicus) | NDVI satellite vegetation index |
| Google Gemini | AI for ARIA voice assistant & disease detection |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   MOBILE APP (Expo)                  │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  Screens │ │ Services │ │ Context Providers   │  │
│  │  (13)    │ │ (5)      │ │ Auth + Language     │  │
│  └──────────┘ └──────────┘ └────────────────────┘  │
│         │            │                              │
│    ┌────┴────────────┴──────┐                      │
│    │   3-Tier Fallback      │                      │
│    │   API → Local ML →     │                      │
│    │   Hardcoded Defaults   │                      │
│    └────────────┬───────────┘                      │
└─────────────────┼───────────────────────────────────┘
                  │ HTTP/REST
┌─────────────────┼───────────────────────────────────┐
│            FASTAPI BACKEND                          │
│                 │                                   │
│  ┌──────────┐ ┌┴─────────┐ ┌────────────────────┐  │
│  │ Routers  │ │ Services │ │ ML Models (v1+v2)  │  │
│  │ (7)      │ │ (3)      │ │ (9 models)         │  │
│  └──────────┘ └──────────┘ └────────────────────┘  │
│         │                          │                │
│  ┌──────┴───────┐  ┌──────────────┴─────────────┐  │
│  │ Decision     │  │ Explainability Engine       │  │
│  │ Engine       │  │ (Human-readable reasoning)  │  │
│  └──────────────┘  └───────────────────────────┘  │
│         │                                          │
│  ┌──────┴───────────────────────────────────────┐  │
│  │         SQLite Database (agrimitra.db)        │  │
│  │  Users | MandiPrices | Weather | Crops |      │  │
│  │  Soil  | Transport | NDVI | PredictionLogs   │  │
│  └──────────────────────────────────────────────┘  │
│         │                                          │
│  ┌──────┴───────────────────────────────────────┐  │
│  │           ETL Pipelines (APScheduler)         │  │
│  │  Mandi (daily) | Weather (daily) | NDVI (wk) │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         │              │              │
    data.gov.in    Open-Meteo     NASA/Sentinel
```

### Context Provider Chain (Frontend)

```
<LanguageProvider>        ← i18n (EN/HI/MR)
  <AuthProvider>          ← JWT authentication
    <NavigationContainer> ← React Navigation
      <App />
    </NavigationContainer>
  </AuthProvider>
</LanguageProvider>
```

---

## 4. Frontend — Mobile Application

### 4.1 Screens (13 Total)

#### 🔐 Authentication Screens

| Screen | Features |
|--------|----------|
| **LoginScreen** | Big logo display, Phone + Password login, 3 Quick Login buttons (Prem/Bhumi/Ashwin), Guest mode access, Navigate to Register |
| **RegisterScreen** | 2-step registration (Basic Info → Farm Details), Crop selection chips, Soil type selection, Big logo header, Progress indicator |

#### 🏠 Main Screens (Bottom Tab Navigation)

| Screen | Tab | Features |
|--------|-----|----------|
| **HomeScreen** | 🏠 Home | Welcome banner with user name, Weather banner widget, Quick action grid (6 feature cards), Crop status summary, Navigation hub to all features |
| **MarketScreen** | 📊 Market | Live mandi prices from data.gov.in, District-wise price comparison, Price trend charts (7/30/90 days), Best market recommendations, Commodity filter & search |
| **AlertsScreen** | 🔔 Alerts | Weather alerts & warnings, Price spike notifications, Spoilage risk alerts, Government scheme deadlines, Categorized alert cards |
| **DashboardScreen** | 📈 Dashboard | Farm overview statistics, Total harvests counter, Savings estimate display, Crop performance metrics, Quick stats cards |
| **ProfileScreen** | 👤 Profile | View/Edit mode toggle, Full profile details (name, phone, district, crop, farm size, soil type), Language preference, Password change, Logout |

#### 📱 Feature Screens (Stack Navigation)

| Screen | Features |
|--------|----------|
| **CropInputScreen** | Multi-parameter input form (crop, district, soil, weather, days since sowing), Preset crop defaults, Input validation, Sends data to prediction API |
| **RecommendationScreen** | AI-generated harvest timing recommendations, Mandi price predictions, Optimal sell window, Spoilage risk gauge, Explainable AI reasoning cards, Confidence scores |
| **SpoilageScreen** | Real-time spoilage risk percentage, Temperature & humidity impact analysis, Storage recommendations, Time-to-spoilage countdown, Color-coded risk levels (Low/Medium/High/Critical) |
| **DiseaseScreen** | AI-powered crop disease detection, Symptom-based diagnosis, Disease description & treatment suggestions, Crop-specific disease database, Severity assessment |
| **SchemesScreen** | Government farm scheme listings, Eligibility checker, Scheme details (benefits, deadline, documents), Category filters, Application guidance |
| **AriaScreen** | ARIA voice assistant interface, Chat-style conversation UI, Voice input with wake word "Hi Aria", Text input option, Multi-language responses, 13 intent recognition categories |

### 4.2 Frontend Services (5)

| Service | File | Purpose |
|---------|------|---------|
| **apiService** | `apiService.js` | Central HTTP client (Axios), Base URL configuration, Error handling, All backend API calls |
| **intelligenceService** | `intelligenceService.js` | Client-side ML engine, 3-tier fallback system, Local crop predictions, Offline recommendation capability |
| **recommendationService** | `recommendationService.js` | Dual recommendation pipeline, Harvest window calculation, Price trend analysis, Spoilage risk computation |
| **ariaService** | `ariaService.js` | ARIA voice assistant engine, Intent recognition (13 categories), Google Gemini integration, Voice transcription, TTS in 3 languages |
| **notificationService** | `notificationService.js` | Expo push notifications, Permission handling, Notification scheduling, Alert delivery |

### 4.3 Components

| Component | Purpose |
|-----------|---------|
| **WeatherBanner** | Compact weather display for HomeScreen, Current temp/humidity/conditions, i18n translated |
| **LanguageSwitcher** | Pill-style EN/HI/MR toggle, Persists choice to AsyncStorage |

---

## 5. Backend — FastAPI Server

### 5.1 Routers (7)

| Router | Prefix | Endpoints | Purpose |
|--------|--------|-----------|---------|
| **auth** | `/auth` | 5 | User registration, login, profile management |
| **predict** | `/predict` | 3+ | ML predictions (harvest, spoilage, price) |
| **intelligence** | `/intelligence` | 3+ | v2 advanced predictions |
| **market** | `/market` | 2+ | Live mandi price data |
| **weather** | `/weather` | 2+ | Weather forecasts & advisories |
| **disease** | `/disease` | 2+ | AI crop disease detection |
| **schemes** | `/schemes` | 2+ | Government scheme recommendations |

### 5.2 Backend Services (3)

| Service | Purpose |
|---------|---------|
| **weather_service** | Open-Meteo & NASA POWER API integration, 7-day forecast, Historical weather data aggregation |
| **mandi_service** | data.gov.in API integration, Real-time commodity prices, District-wise market data |
| **feature_engineering** | Raw data → ML features, Temporal features (season, lunar phase), Rolling statistics, Multi-source feature fusion |

### 5.3 Core Modules

| Module | Purpose |
|--------|---------|
| **config.py** | Pydantic Settings, API keys, database URL, ETL schedules, security settings |
| **middleware.py** | CORS configuration, Request logging, Error handling middleware |
| **logging.py** | Structured logging with structlog, JSON log formatting |
| **exceptions.py** | Custom exception classes for consistent error responses |

---

## 6. AI / ML Models

### 6.1 Version 1 — Rule-Based + Statistical Models

| Model | Type | Predicts |
|-------|------|----------|
| **HarvestWindowModel v1** | Rule-based + Logistic Regression | Optimal harvest date based on crop maturity, weather, soil |
| **SpoilageRiskModel v1** | Physics-informed rules | Spoilage probability based on temperature, humidity, storage |
| **PriceTrendModel v1** | Statistical + seasonal patterns | Short-term price direction (up/down/stable) |

### 6.2 Version 2 — Machine Learning Models

| Model | Algorithm | Predicts |
|-------|-----------|----------|
| **HarvestWindowModel v2** | Multi-signal ensemble | Precise harvest window with confidence intervals |
| **SpoilageRiskModel v2** | Physics-informed + GradientBoosting | Time-to-spoilage with environmental factor decomposition |
| **PriceTrendModel v2** | GradientBoosting Regressor | Price forecasts with mandi-wise recommendations |
| **MandiRecommendationEngine** | Multi-factor scoring | Best market to sell (price × distance × spoilage risk) |
| **NeighborIntelligence** | KNN-based | What nearby farmers with similar conditions are doing |
| **SeasonalModel** | Time-series | Seasonal price patterns for long-term planning |

### 6.3 Model Features Used

```
Input Features:
├── Crop Parameters (maturity days, shelf life, category)
├── Weather (temp, humidity, rainfall, wind, solar radiation)
├── Soil (pH, organic carbon, N-P-K, quality index)
├── Market (current price, 7/30/90-day trends, volume)
├── Satellite (NDVI vegetation index)
├── Temporal (day of year, season, lunar phase)
└── Transport (distance to mandi, road quality, fuel cost)

Output Predictions:
├── Harvest Window: {start_date, end_date, confidence}
├── Spoilage Risk: {risk_pct, hours_remaining, factors}
├── Price Trend: {direction, predicted_price, confidence}
└── Mandi Recommendation: {best_market, expected_profit, reasoning}
```

---

## 7. Database Schema

**Database**: SQLite (`agrimitra.db`)  
**ORM**: SQLAlchemy 2.0

### 7.1 Tables (8)

#### `users` — Registered Farmers

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment ID |
| phone | String(15) | Unique, indexed, login identifier |
| password_hash | String(255) | bcrypt hashed password |
| full_name | String(200) | Farmer's name |
| email | String(200) | Optional email |
| district | String(100) | District (e.g., Nashik) |
| state | String(100) | State (default: Maharashtra) |
| main_crop | String(100) | Primary crop grown |
| farm_size_acres | Float | Farm area in acres |
| soil_type | String(100) | Soil classification |
| language | String(5) | Preferred language (hi/en/mr) |
| is_active | Boolean | Account status |
| total_harvests | Integer | Lifetime harvest count |
| savings_estimate | Float | Estimated savings from app usage |
| created_at | DateTime | Registration timestamp |
| updated_at | DateTime | Last profile update |

#### `mandi_prices` — Market Commodity Prices

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment |
| commodity | String(100) | Crop name |
| market | String(200) | Mandi name |
| district | String(100) | District |
| state | String(100) | State |
| min_price | Float | Minimum price (₹/quintal) |
| max_price | Float | Maximum price (₹/quintal) |
| modal_price | Float | Most common price |
| arrival_date | Date | Price recording date |
| arrival_qty_tonnes | Float | Quantity arrived |
| *Unique*: (commodity, market, arrival_date) | | |

#### `weather_records` — Weather Data

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment |
| district | String(100) | District |
| state | String(100) | State |
| date | Date | Observation date |
| temp_max / temp_min | Float | Temperature range (°C) |
| humidity_avg | Float | Average humidity (%) |
| rainfall_mm | Float | Precipitation (mm) |
| wind_speed_kmh | Float | Wind speed |
| solar_radiation_mj | Float | Solar radiation (MJ/m²) |
| *Unique*: (district, date) | | |

#### `crop_meta` — Crop Parameters (FAO Data)

| Column | Type | Description |
|--------|------|-------------|
| crop | String(100) | Crop name (PK-like) |
| maturity_days_min/max | Integer | Growth period range |
| shelf_life_days_open/cold | Integer | Storage duration |
| optimal_temp_min/max | Float | Ideal temperature (°C) |
| optimal_humidity_min/max | Float | Ideal humidity (%) |
| fao_post_harvest_loss_pct | Float | FAO loss percentage |
| base_price_per_quintal | Float | Baseline price (₹) |
| category | String(50) | vegetable/cereal/fruit/oilseed/fiber/cash_crop |

#### `soil_profiles` — District Soil Health (ICAR Data)

| Column | Type | Description |
|--------|------|-------------|
| district | String(100) | District name |
| soil_type | String(100) | Classification |
| ph | Float | Soil pH |
| organic_carbon_pct | Float | Organic carbon (%) |
| nitrogen_kg_ha | Float | Available Nitrogen |
| phosphorus_kg_ha | Float | Available Phosphorus |
| potassium_kg_ha | Float | Available Potassium |
| soil_quality_index | Float | Composite quality score (0-1) |

#### `transport_routes` — Farm-to-Market Routes

| Column | Type | Description |
|--------|------|-------------|
| origin_district | String(100) | Farm district |
| destination_market | String(200) | Target mandi |
| distance_km | Float | Route distance |
| estimated_time_hours | Float | Travel time |
| road_quality | String(20) | good/moderate/poor |
| fuel_cost_per_km | Float | Fuel expenditure |
| spoilage_rate_per_hour | Float | Hourly spoilage % during transit |

#### `ndvi_records` — Satellite Vegetation Index

| Column | Type | Description |
|--------|------|-------------|
| district | String(100) | District |
| date | Date | Observation date |
| ndvi_mean | Float | Average NDVI (-1 to 1) |
| ndvi_min/max | Float | NDVI range |
| cloud_cover_pct | Float | Cloud coverage |

#### `prediction_logs` — ML Audit Trail

| Column | Type | Description |
|--------|------|-------------|
| prediction_type | String(50) | harvest/mandi/spoilage |
| crop | String(100) | Crop predicted for |
| district | String(100) | Location |
| input_params | Text (JSON) | All input features |
| output_result | Text (JSON) | Prediction output |
| confidence | Float | Model confidence (0-1) |
| model_version | String(50) | v1/v2 identifier |
| data_sources_used | Text | APIs used for this prediction |

---

## 8. Authentication System

### Flow

```
Register → POST /auth/register → Create User (bcrypt hash) → JWT Token → Auto-login
Login    → POST /auth/login    → Verify Password           → JWT Token → Dashboard
Guest    → Skip auth           → Access all features (read-only)
```

### Details

| Parameter | Value |
|-----------|-------|
| **Algorithm** | HS256 (HMAC-SHA256) |
| **Token Expiry** | 30 days |
| **Password Hashing** | bcrypt via passlib |
| **Storage** | AsyncStorage (mobile) |
| **Auth Header** | `Authorization: Bearer <token>` |
| **Protected Endpoints** | GET /auth/me, PUT /auth/me, PUT /auth/me/password |
| **Guest Mode** | Full app access without login |

### Quick Login Accounts

| Name | Phone | Password | Profile |
|------|-------|----------|---------|
| **Prem** | 9876543001 | prem123456 | Nashik, Onion, 5 acres, Black soil |
| **Bhumi** | 9876543002 | bhumi123456 | Pune, Tomato, 3.5 acres, Red soil |
| **Ashwin** | 9876543003 | ashwin123456 | Nagpur, Wheat, 8 acres, Alluvial soil |

---

## 9. Multi-Language System (i18n)

### Supported Languages

| Code | Language | Script |
|------|----------|--------|
| `en` | English | Latin |
| `hi` | हिंदी (Hindi) | Devanagari |
| `mr` | मराठी (Marathi) | Devanagari |

### Implementation

- **Custom lightweight i18n** — no heavy library dependency
- **Dot-path key resolution**: `t('auth.loginTitle')` → "Welcome Back" / "वापस स्वागत है" / "पुन्हा स्वागत"
- **Parameter interpolation**: `t('home.welcome', { name: 'Prem' })` → "Welcome, Prem!"
- **AsyncStorage persistence** — language choice survives app restarts
- **LanguageSwitcher component** — pill-style EN | HI | MR toggle on every screen
- **425+ translation keys** covering all 13 screens

### Translation Coverage

| Category | Keys |
|----------|------|
| Common (buttons, labels) | ~30 |
| Auth (login, register) | ~25 |
| Home (dashboard, greeting) | ~20 |
| Market (prices, trends) | ~40 |
| Recommendations | ~50 |
| Spoilage | ~30 |
| Disease | ~30 |
| Schemes | ~25 |
| Alerts | ~20 |
| Profile | ~25 |
| ARIA assistant | ~30 |
| Weather | ~20 |
| Errors & status | ~30 |

---

## 10. ARIA — AI Voice Assistant

**ARIA** (Agricultural Resource & Intelligence Assistant) is the app's built-in AI assistant.

### Capabilities

| Feature | Details |
|---------|---------|
| **Wake Word** | "Hi Aria" — activates voice listening |
| **Voice Input** | Records audio → Google Gemini transcription |
| **Text Input** | Type questions directly |
| **13 Intents** | weather, market_price, harvest, spoilage, disease, scheme, soil, crop_recommendation, transport, alert, profile, greeting, general |
| **Multi-language** | Understands and responds in EN/HI/MR |
| **TTS** | Text-to-Speech responses via expo-speech |
| **Context-Aware** | Uses user's crop, district, farm profile |

### Conversation Modes (7-State Machine)

```
IDLE → LISTENING → PROCESSING → RESPONDING → IDLE
         ↓
      WAKE_WORD → ACTIVE_LISTENING → PROCESSING
         ↓
       ERROR → IDLE
```

### Example Interactions

| User Says | ARIA Response |
|-----------|--------------|
| "What's the weather in Nashik?" | "Nashik: 32°C, partly cloudy. Light rain expected tomorrow. Good time for onion harvesting." |
| "Onion ka bhav kya hai?" | "नाशिक मंडी में प्याज ₹2,150/क्विंटल, लासलगाव में ₹2,280/क्विंटल।" |
| "My tomato leaves are yellow" | "This could be nitrogen deficiency or early blight. Recommended: Apply neem-based fungicide..." |

---

## 11. ETL Pipelines

Automated data ingestion runs on **APScheduler**:

### Pipeline Schedule

| Pipeline | Schedule | Source | Target Table |
|----------|----------|--------|-------------|
| **Mandi ETL** | Daily (6:00 AM) | data.gov.in API | `mandi_prices` |
| **Weather ETL** | Daily (5:00 AM) | Open-Meteo + NASA POWER | `weather_records` |
| **NDVI ETL** | Weekly (Sunday) | Sentinel-2 / Copernicus | `ndvi_records` |

### Data Coverage

- **10 districts**: Nashik, Pune, Nagpur, Aurangabad, Solapur, Kolhapur, Amravati, Jalgaon, Sangli, Ahmednagar
- **10 commodities**: Onion, Tomato, Wheat, Rice, Potato, Soybean, Cotton, Grape, Sugarcane, Banana
- **Upsert strategy**: `INSERT + IntegrityError catch` (database-agnostic)

---

## 12. Decision Engine & Explainability

### Decision Engine

The **Decision Engine** orchestrates predictions by:

1. Collecting inputs from user + database (weather, soil, market data)
2. Running v1 (rule-based) + v2 (ML) models in parallel
3. Fusing results with confidence-weighted ensemble
4. Generating actionable recommendations
5. Logging predictions for audit trail

### Explainability Engine

Every prediction includes human-readable explanations:

```json
{
  "prediction": "Harvest in 5-8 days",
  "confidence": 0.87,
  "explanation": {
    "factors": [
      {"factor": "Crop Maturity", "impact": "positive", "detail": "Onion at 128 days (optimal: 110-140 days)"},
      {"factor": "Weather", "impact": "positive", "detail": "No rain forecast for next 7 days — ideal for harvest"},
      {"factor": "Market Price", "impact": "positive", "detail": "Prices trending UP (+8% in 7 days at Lasalgaon)"},
      {"factor": "Spoilage Risk", "impact": "warning", "detail": "Humidity at 72% — harvest soon to avoid losses"}
    ],
    "recommendation": "Harvest within 5-8 days and sell at Lasalgaon Mandi for best returns.",
    "data_sources": ["Open-Meteo Weather", "data.gov.in Mandi Prices", "ICAR Soil Data"]
  }
}
```

---

## 13. API Endpoints Reference

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create new user account |
| POST | `/auth/login` | No | Login with phone + password |
| GET | `/auth/me` | Yes | Get current user profile |
| PUT | `/auth/me` | Yes | Update profile fields |
| PUT | `/auth/me/password` | Yes | Change password |

### Predictions (`/predict`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict/harvest` | Predict optimal harvest window |
| POST | `/predict/spoilage` | Calculate spoilage risk |
| POST | `/predict/price` | Predict price trends |

### Intelligence (`/intelligence`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/intelligence/full-analysis` | Complete crop analysis (all models) |
| POST | `/intelligence/mandi-recommendation` | Best market to sell |
| GET | `/intelligence/neighbor-insights` | What nearby farmers are doing |

### Market (`/market`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/market/prices` | Live mandi prices |
| GET | `/market/trends/{commodity}` | Price trend data |

### Weather (`/weather`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/weather/forecast/{district}` | 7-day weather forecast |
| GET | `/weather/advisory/{district}` | Farming weather advisory |

### Disease (`/disease`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/disease/detect` | AI disease detection |
| GET | `/disease/database` | Disease information lookup |

### Schemes (`/schemes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schemes/list` | Available government schemes |
| GET | `/schemes/eligible` | Personalized eligible schemes |

---

## 14. Seed Data & Demo Accounts

### Pre-loaded Data

| Data | Count | Source |
|------|-------|--------|
| Crop Metadata | 10 crops | FAO Post-Harvest Loss Studies |
| Soil Profiles | 10 districts | ICAR Soil Health Survey |
| Transport Routes | 19 routes | Known mandi locations |
| Demo Users | 3 accounts | Pre-configured for testing |

### Crops Covered

Onion, Tomato, Wheat, Rice, Potato, Soybean, Cotton, Grape, Sugarcane, Banana

### Districts Covered

Nashik, Pune, Nagpur, Aurangabad, Solapur, Kolhapur, Amravati, Jalgaon, Sangli, Ahmednagar

---

## 15. Setup & Installation

### Prerequisites

- **Node.js** 18+ & npm
- **Python** 3.11+
- **Expo CLI** (`npm install -g expo-cli`)
- **Android device/emulator** with Expo Go app

### Backend Setup

```bash
cd agrichain-backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Initialize database & seed data
python -c "from db.session import init_db; init_db()"
python -c "from db.session import SessionLocal; from db.seed import run_all_seeds; db = SessionLocal(); run_all_seeds(db); db.close()"

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd AgriChain

# Install dependencies
npm install

# Start Expo
npx expo start --android
```

### Environment Variables (Optional)

Create `agrichain-backend/.env`:

```env
DATABASE_URL=sqlite:///./agrimitra.db
SECRET_KEY=your-secret-key-here
DATA_GOV_API_KEY=your-data-gov-key
GEMINI_API_KEY=your-google-gemini-key
```

---

## 16. Project Structure

```
d:\beadsheet\
│
├── AgriChain/                          # 📱 Mobile App (Expo/React Native)
│   ├── App.js                          # Root component, navigation, providers
│   ├── app.json                        # Expo config
│   ├── package.json                    # npm dependencies
│   ├── assets/                         # Images, icons
│   │   ├── logo (2).jpeg              # AGRI-मित्र logo
│   │   ├── icon.png                   # App icon
│   │   └── splash-icon.png           # Splash screen
│   └── src/
│       ├── components/
│       │   ├── WeatherBanner.js       # Weather display widget
│       │   └── LanguageSwitcher.js    # EN/HI/MR toggle
│       ├── context/
│       │   ├── AuthContext.js         # JWT auth state management
│       │   └── LanguageContext.js     # i18n language provider
│       ├── i18n/
│       │   ├── index.js              # Translation engine
│       │   ├── en.js                  # English translations
│       │   ├── hi.js                  # Hindi translations
│       │   └── mr.js                  # Marathi translations
│       ├── screens/
│       │   ├── LoginScreen.js         # Login + Quick Login
│       │   ├── RegisterScreen.js      # 2-step registration
│       │   ├── HomeScreen.js          # Main dashboard
│       │   ├── DashboardScreen.js     # Farm analytics
│       │   ├── ProfileScreen.js       # User profile
│       │   ├── MarketScreen.js        # Mandi prices
│       │   ├── AlertsScreen.js        # Notifications
│       │   ├── CropInputScreen.js     # Prediction input form
│       │   ├── RecommendationScreen.js # AI recommendations
│       │   ├── SpoilageScreen.js      # Spoilage risk
│       │   ├── DiseaseScreen.js       # Disease detection
│       │   ├── SchemesScreen.js       # Govt schemes
│       │   └── AriaScreen.js          # Voice assistant
│       ├── services/
│       │   ├── apiService.js          # HTTP client
│       │   ├── intelligenceService.js # Client-side ML
│       │   ├── recommendationService.js # Recommendation engine
│       │   ├── ariaService.js         # ARIA voice AI
│       │   └── notificationService.js # Push notifications
│       ├── theme/
│       │   └── colors.js             # Color palette
│       └── data/
│           ├── agriOptions.js         # Dropdown options
│           └── marketData.js          # Fallback market data
│
├── agrichain-backend/                  # ⚙️ Backend (FastAPI + Python)
│   ├── main.py                        # FastAPI app entry point
│   ├── requirements.txt               # Python dependencies
│   ├── agrimitra.db                   # SQLite database
│   ├── pytest.ini                     # Test configuration
│   ├── decision_engine.py             # ML orchestration
│   ├── explainability_engine.py       # XAI reasoning generator
│   ├── core/
│   │   ├── config.py                  # App settings (Pydantic)
│   │   ├── middleware.py              # CORS, logging middleware
│   │   ├── logging.py                 # structlog config
│   │   └── exceptions.py             # Custom exceptions
│   ├── db/
│   │   ├── models.py                  # SQLAlchemy models (8 tables)
│   │   ├── session.py                 # DB engine & session
│   │   └── seed.py                    # Seed data (crops, soil, users)
│   ├── models/
│   │   ├── spoilage_risk_model.py     # Spoilage prediction (v1+v2)
│   │   ├── harvest_window_model.py    # Harvest timing (v1+v2)
│   │   └── price_trend_model.py       # Price forecast (v1+v2)
│   ├── routers/
│   │   ├── auth.py                    # Authentication endpoints
│   │   ├── predict.py                 # Prediction endpoints
│   │   ├── market.py                  # Market data endpoints
│   │   ├── weather.py                 # Weather endpoints
│   │   ├── disease.py                 # Disease detection endpoints
│   │   └── schemes.py                # Scheme endpoints
│   ├── services/
│   │   ├── weather_service.py         # Weather API integration
│   │   ├── mandi_service.py           # data.gov.in integration
│   │   └── feature_engineering.py     # Feature extraction
│   ├── etl/
│   │   ├── mandi_etl.py              # Daily mandi price ingestion
│   │   ├── weather_etl.py            # Daily weather data ingestion
│   │   └── ndvi_etl.py               # Weekly NDVI satellite data
│   └── tests/
│       └── test_api.py                # API test suite
│
└── scripts/
    └── setup_dev.py                   # Development setup script
```

---

## 📊 Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Source Files** | 50+ |
| **Frontend Screens** | 13 |
| **Backend API Endpoints** | 18+ |
| **ML Models** | 9 (v1 + v2) |
| **Database Tables** | 8 |
| **Languages Supported** | 3 (EN, HI, MR) |
| **Translation Keys** | 425+ |
| **Crops Covered** | 10 |
| **Districts Covered** | 10 (Maharashtra) |
| **External APIs** | 5 |
| **ETL Pipelines** | 3 (automated) |
| **Demo Users** | 3 |

---

> **Built with ❤️ for Indian Farmers**  
> **AGRI-मित्र** — *Your Intelligent Farming Companion*

---

*Document generated: February 27, 2026*
