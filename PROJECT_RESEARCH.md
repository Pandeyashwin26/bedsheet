# AGRI-मित्र — Comprehensive Project Research Document

> **Version:** 1.0 | **Date:** June 2025  
> **Workspace:** `d:\beadsheet` | **Package name:** `agri-mitra` v1.0.0

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend Screens](#3-frontend-screens)
4. [API Endpoints](#4-api-endpoints)
5. [ML Models](#5-ml-models)
6. [Database Models](#6-database-models)
7. [Services Layer](#7-services-layer)
8. [Authentication System](#8-authentication-system)
9. [Internationalization (i18n)](#9-internationalization-i18n)
10. [ETL Pipelines](#10-etl-pipelines)
11. [ARIA Voice Assistant](#11-aria-voice-assistant)
12. [Notable Features & Design Patterns](#12-notable-features--design-patterns)

---

## 1. Tech Stack

### Frontend (React Native + Expo)

| Category | Technology | Version |
|---|---|---|
| Framework | React Native | 0.83.2 |
| Platform | Expo SDK | ~55 |
| React | React | 19.2.0 |
| Navigation | React Navigation (Stack + Bottom Tabs) | 7.x |
| UI Library | React Native Paper | 5.x |
| Charts | react-native-chart-kit | — |
| Camera | expo-camera | — |
| Audio | expo-av | — |
| Speech | expo-speech | — |
| Location | expo-location | — |
| Notifications | expo-notifications | — |
| Storage | @react-native-async-storage | — |
| HTTP | axios | — |
| Icons | @expo/vector-icons (MaterialCommunityIcons) | — |
| SVG | react-native-svg | — |
| Animations | react-native-reanimated | — |
| Linear Gradient | expo-linear-gradient | — |
| File System | expo-file-system | — |

### Backend (FastAPI / Python)

| Category | Technology |
|---|---|
| Web Framework | FastAPI + Uvicorn |
| ORM | SQLAlchemy 2.x |
| Validation | Pydantic v2 (Settings) |
| Auth | python-jose (JWT HS256), passlib (bcrypt) |
| ML | scikit-learn, XGBoost (GradientBoostingRegressor) |
| Numerical | NumPy |
| Scheduling | APScheduler (AsyncIOScheduler) |
| Logging | structlog |
| HTTP Client | requests, httpx |
| Database | SQLite (dev, `agrimitra.db`), PostgreSQL-ready |
| Caching | cachetools (TTLCache) |

### External APIs

| API | Purpose | Key Config |
|---|---|---|
| OpenWeatherMap | 5-day weather forecast | `EXPO_PUBLIC_OPENWEATHER_API_KEY` |
| data.gov.in (Agmarknet) | Mandi prices for Maharashtra | `EXPO_PUBLIC_DATA_GOV_API_KEY` / `DATAGOV_API_KEY` |
| Google Gemini 2.0 Flash | ARIA chatbot, schemes search, audio transcription, intent parsing | `EXPO_PUBLIC_GOOGLE_API_KEY` / `GOOGLE_API_KEY` |
| HuggingFace Inference | MobileNet V2 plant disease detection | `HF_TOKEN` |
| NASA POWER | Historical weather data (ETL, no key required) | — |
| OpenWeatherMap OneCall 3.0 | Frontend recommendation service | `EXPO_PUBLIC_OPENWEATHER_API_KEY` |

### Theme Colors

```
primary:    #1B4332 (deep green)
accent:     #52B788 (bright green)
background: #F8F9FA (off-white)
card:       #FFFFFF
text:       #1A1A1A
warning:    #E63946 (red)
safe:       #2DC653 (green)
chain:      #7B2FBE (purple)
```

---

## 2. Architecture Overview

### System Topology

```
┌──────────────────────────────────────────────────────────────────┐
│                   React Native / Expo App                        │
│                                                                  │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────────────────┐ │
│  │ 13 Screens │  │ ARIA Voice  │  │ Smart Recommendation      │ │
│  │ (UI Layer) │  │ Engine      │  │ Service (client-side ML)  │ │
│  └─────┬──────┘  └──────┬──────┘  └───────────────┬───────────┘ │
│        │                │                          │             │
│  ┌─────┴────────────────┴──────────────────────────┴──────────┐ │
│  │  apiService.js  (3-tier fallback: network → cache → mock)  │ │
│  └────────────────────────────┬────────────────────────────────┘ │
└───────────────────────────────┼──────────────────────────────────┘
                                │ HTTP/HTTPS
┌───────────────────────────────┼──────────────────────────────────┐
│                    FastAPI Backend                                │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐ ┌──────────────┐ │
│  │ auth     │ │ predict  │ │ intelligence   │ │ market/      │ │
│  │ router   │ │ router   │ │ router (v2)    │ │ weather/     │ │
│  │          │ │ (legacy) │ │ (DB-backed ML) │ │ disease/     │ │
│  │          │ │          │ │                │ │ schemes      │ │
│  └────┬─────┘ └────┬─────┘ └───────┬────────┘ └───────┬──────┘ │
│       │            │               │                   │        │
│  ┌────┴────────────┴───────────────┴───────────────────┴─────┐  │
│  │                    ML Model Layer                          │  │
│  │  PricePredictor │ SpoilageModel │ HarvestModel │ RecEng.  │  │
│  └───────────────────────────┬────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴────────────────────────────────┐  │
│  │            SQLAlchemy ORM + Database Layer                  │  │
│  │  MandiPrice│WeatherRecord│SoilProfile│NDVIRecord│CropMeta  │  │
│  └───────────────────────────┬────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴────────────────────────────────┐  │
│  │            ETL Scheduler (APScheduler)                      │  │
│  │  MandiETL (daily) │ WeatherETL (daily) │ NDVI ETL (weekly) │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Context Providers (React)

```
SafeAreaProvider
  └── PaperProvider (React Native Paper theme)
       └── LanguageProvider (hi/en/mr, default: hi)
            └── AuthProvider (JWT session management)
                 └── AriaProvider (voice assistant state machine)
                      └── NavigationContainer
                           └── Stack Navigator
                                ├── LoginScreen
                                ├── RegisterScreen
                                └── MainTabs (Bottom Tab Navigator)
                                     ├── Home
                                     ├── Market
                                     ├── Disease (Scan)
                                     ├── ARIA
                                     └── Profile
                                (+ CropInput, Recommendation,
                                   Spoilage, Alerts, Schemes,
                                   Dashboard as stack screens)
```

---

## 3. Frontend Screens

### 3.1 LoginScreen

- **Phone + password** form with validation
- **3 Quick Login accounts** for demo:
  - Prem Kumar — 9876543001 / demo123
  - Bhumi Devi — 9876543002 / demo123
  - Ashwin Patil — 9876543003 / demo123
- **Guest mode** ("Skip for now" → MainTabs without auth)
- Register link at bottom

### 3.2 RegisterScreen

- **2-step wizard**:
  - Step 1: Name, phone, password, confirm password
  - Step 2: District, main crop, farm size (acres), soil type
- **Crop selection** (8): Onion, Tomato, Wheat, Rice, Potato, Soybean, Cotton, Sugarcane
- **Soil types** (7): Black, Red, Alluvial, Laterite, Sandy, Clay, Loamy
- On success → JWT token → MainTabs

### 3.3 HomeScreen

- **Welcome header** with user greeting + gradient
- **WeatherBanner** component (current weather)
- **LanguageSwitcher** component
- **6 action cards**:
  | Card | Navigation Target |
  |---|---|
  | Harvest Advisor | CropInput |
  | Best Mandi | Market tab |
  | Spoilage Risk | Spoilage |
  | Disease Scanner | Disease tab |
  | Govt Schemes | Schemes |
  | Smart Alerts | Alerts |
- **ARIA FAB** button (floating mic)

### 3.4 MarketScreen

- **District filter** (6 districts): Nashik, Pune, Nagpur, Aurangabad, Solapur, Kolhapur
- **Crop filter**: All, Onion, Tomato, Wheat, Rice, Potato
- Price cards showing: commodity name, ₹/kg, daily change (↑/↓ arrows with color)
- **Expandable 30-day LineChart** per crop
- **Best selling period** indicator
- **Neighbor intelligence**: "432 किसान selling onion in Nashik this week"
- API fetch with **AsyncStorage cache** (30-min TTL), fallback to local `marketData.js`

### 3.5 CropInputScreen

- **Crop picker** (6 options from `agriOptions.js`)
- **Crop stage**: Early Stage / Growing Well / Ready to Harvest
- **GPS auto-detect district** via `expo-location` + reverse geocoding, with manual override
- **Soil type picker** (4 options)
- **Sowing date picker** (native DateTimePicker)
- **Storage type picker**: Open Field / Warehouse / Cold Storage
- **Transit hours slider** (1–48 hours)
- Validates all fields → navigates to `RecommendationScreen` with `formData`

### 3.6 RecommendationScreen

- **Harvest window** card: start–end dates, "N day window for best results"
- **Risk if delayed** message
- **Best mandi recommendation** with price range (₹min – ₹max per quintal)
- **Transport cost** estimate
- **Net profit comparison**: Local sale vs Best mandi
- **"Why this recommendation?"** expandable section with:
  - Weather reason (rain forecast icon + text)
  - Market reason (price trend icon + text)
  - Supply reason (soil/growth icon + text)
- **Confidence indicator** (High/Medium/Regional averages with color)
- **Offline banner** for cached data mode
- **Spoilage check button** → SpoilageScreen
- **ARIA FAB** for voice help
- **Dual data source**: calls backend `apiService` endpoints AND client-side `recommendationService`

### 3.7 SpoilageScreen

- **Animated circular risk meter** (SVG `<Circle>` with animated `strokeDashoffset`)
- **Input controls**: crop selector, days since harvest (0–30 slider), storage type, transit hours (1–48), current temperature (from weather)
- **Output**: risk score %, risk category badge (Low=green / Medium=yellow / High=orange / Critical=red)
- **Days safe** indicator
- **Risk factors** list (temperature, transit, storage contribution)
- **Preservation actions** ranked:
  | Rank | Action | Cost/Quintal | Saves |
  |---|---|---|---|
  | 1 (Cheapest) | Sell immediately at local market | ₹0 | ~24% |
  | 2 (Moderate) | Move to cold storage | ₹450 | ~84% |
  | 3 (Best) | Grade + warehouse storage | ₹780 | ~91% |
- **Action buttons**: Find Cold Storage → Google Maps, "How to do this?" → ARIA guide, Sell Now → Market

### 3.8 DiseaseScreen

- **Live camera** view (expo-camera `CameraView`)
- Take photo or pick from gallery
- Sends base64 image directly to **HuggingFace MobileNet V2** plant disease model
- **Results display**:
  - Disease name in Hindi + English
  - Confidence bar (percentage)
  - Harvest impact message
- **Treatment options** (ranked):
  | Option | Cost/Acre |
  |---|---|
  | Neem oil spray (cheapest) | ₹120 |
  | Mancozeb + Carbendazim | ₹340 |
  | Copper Oxychloride + systemic fungicide | ₹580 |
- **Disease knowledge base**: covers 22+ diseases across Tomato, Onion, Potato, Corn, Rice, Wheat
- "Update Crop Plan" and "Scan Another" buttons

### 3.9 SchemesScreen

- **Auto-detects state** from GPS coordinates
- **Crop filter** selector
- Fetches schemes from **Google Gemini AI** (structured JSON prompt)
- **Fallback** to 4 static schemes:
  | Scheme | Benefit |
  |---|---|
  | PM-KISAN Samman Nidhi | ₹6,000/year |
  | PMFBY (Fasal Bima) | Up to 80% crop damage coverage |
  | KCC (Kisan Credit Card) | Loan up to ₹3L at 4% interest |
  | MSP | ₹2,275/quintal (Wheat 2024-25) |
- Each card shows: name, benefit, eligibility, how to apply, deadline countdown
- "Apply Now" button opens URL in browser

### 3.10 AlertsScreen

- Static demonstration alerts (3 alerts):
  1. **Supply Alert** (orange): Neighbor supply → check other mandis
  2. **Scheme Alert** (blue): PM-KISAN deadline → View Schemes
  3. **Harvest Alert** (green): Harvest window starting → View Plan
- Color-coded by type: weather🌧️, price📈, supply👥, scheme🏛️, crop⏰
- Sorted by urgency
- Action buttons navigate to relevant screens

### 3.11 DashboardScreen

- **User stats**: main crop, farm size, total harvests, savings estimate
- **Quick actions**: check prices, scan disease, weather, edit profile
- **ARIA AI insight card** with personalized message
- Member-since info
- Pull-to-refresh

### 3.12 ProfileScreen

- **View/edit** profile fields: full_name, email, district, state, main_crop, farm_size_acres, soil_type
- **Language switcher** (hi/en/mr)
- **Password change** (current + new password)
- **Logout** with confirmation dialog
- **Dashboard** link
- **Guest mode** shows login/register prompt

### 3.13 AriaScreen

- Full-featured **AI chat interface** (text + voice)
- **Language pills** at header (Hindi, English, Marathi)
- **Suggested questions** in empty state (crop-aware)
- **Quick reply chips**: "क्यों?", "और बताओ", "सरकारी योजना?", "Expert बुलाओ"
- **Voice recording** (press-and-hold mic) → Gemini multimodal transcription
- **Text-to-speech** for bot responses (expo-speech)
- **Speaking overlay** with animated wave bars
- **Topic seeding**: context-aware (e.g., calcium chloride storage guide)
- Uses `fetchAriaReply` (Gemini chat), `getAriaFallbackReply` (offline), `transcribeWithWhisper` → `transcribeAudio` (Gemini multimodal)

---

## 4. API Endpoints

### 4.1 Auth Router (`/auth`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register new user (phone, password, name, farm details) → JWT | No |
| POST | `/auth/login` | Login with phone + password → JWT | No |
| GET | `/auth/me` | Get current user profile | Yes |
| PUT | `/auth/me` | Update profile fields | Yes |
| PUT | `/auth/me/password` | Change password | Yes |

### 4.2 Predict Router (`/predict`) — Legacy v1

| Method | Path | Description |
|---|---|---|
| POST | `/predict/harvest` | Harvest window prediction |
| POST | `/predict/mandi` | Best mandi recommendation |
| POST | `/predict/spoilage` | Spoilage risk assessment |
| POST | `/predict/explain` | Explainability (reasons) |

**Pipeline** (`_run_pipeline()`):
1. `build_features()` — combine weather + mandi + crop meta
2. `price_trend_model.predict()` — calibrated logistic regression
3. `spoilage_risk_model.predict()` — rule-based risk scoring
4. `harvest_window_model.predict()` — maturity + weather + price signals
5. `combine_model_outputs()` — decision engine
6. `generate_explanation()` — human-readable reasons

### 4.3 Intelligence Router (`/intelligence`) — v2 (DB-backed ML)

| Method | Path | Description |
|---|---|---|
| POST | `/intelligence/price-forecast` | 7–15 day XGBoost price forecast |
| POST | `/intelligence/spoilage-risk` | Multi-factor spoilage assessment |
| POST | `/intelligence/harvest-window` | Optimal harvest timing (maturity + NDVI + weather + price) |
| POST | `/intelligence/mandi-recommend` | Ranked mandi recommendations by net profit |
| POST | `/intelligence/full-advisory` | Combined advisory (all signals in one call) |
| POST | `/intelligence/train-model` | Train/retrain price prediction model |
| GET | `/intelligence/etl-status` | ETL scheduler status |
| GET | `/intelligence/data-status` | Row counts per DB table |

### 4.4 Market Router (`/api/market`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/market/prices` | Mandi prices by district + 30-day history + neighbor intelligence |

### 4.5 Weather Router (`/api/weather`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/weather/{district}` | Weather forecast with Hindi alerts |

### 4.6 Disease Router (`/api/disease`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/disease/scan` | Proxy base64 image → HuggingFace disease detection |

### 4.7 Schemes Router (`/api/schemes`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/schemes` | Gemini-powered govt scheme discovery (crop + state filter) |

### 4.8 General

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check (status, services, version) |

---

## 5. ML Models

### 5.1 PriceTrendModel (Legacy v1)

- **Location**: `agrichain-backend/models/price_trend_model.py`
- **Algorithm**: Calibrated Logistic Regression via `CalibratedClassifierCV` (sigmoid, 3-fold CV)
- **Training**: Self-trains on 240 synthetic samples at init (inline)
- **Features**: `price_7d_avg`, `price_14d_avg`, `price_momentum`, `arrival_pressure`, `rain_in_7days`, `avg_temp`
- **Output**: direction (rising/falling/stable), confidence (0.5–0.97), expected price range
- **Vectorization**: `DictVectorizer` → `StandardScaler` → `LogisticRegression`
- **Fallback**: heuristic based on momentum + arrival pressure

### 5.2 SpoilageRiskModel (Legacy v1)

- **Location**: `agrichain-backend/models/spoilage_risk_model.py`
- **Algorithm**: Pure rule-based
- **Base risk by storage**: open_field=0.7, warehouse=0.4, cold_storage=0.15
- **Crop decay rates**: tomato=0.04/day (fastest), wheat/rice=0.0015 (slowest)
- **Factors**: storage type, crop type, days since harvest, transit hours, temperature (>30°C penalty), humidity, rain
- **Output**: risk_score (0–0.95), risk_category (Low/Medium/High/Critical), days_safe, risk_factors list, preservation actions

### 5.3 HarvestWindowModel (Legacy v1)

- **Location**: `agrichain-backend/models/harvest_window_model.py`
- **Algorithm**: Blended rule + signal model
- **Signals**: sowing date + maturity days (base), rain/extreme weather, price momentum, crop stage
- **Decision logic**: rain → harvest now; prices falling → harvest now; prices rising + low spoilage → wait; extreme weather → sell immediately
- **Output**: harvest_window {start, end}, recommendation (harvest_now/wait_N_days), risk_if_delayed, confidence

### 5.4 PricePredictor (v2 — DB-backed ML)

- **Location**: `agrichain-backend/ml/price_predictor.py`
- **Algorithm**: `GradientBoostingRegressor` (sklearn) — 200 estimators, depth 6, lr 0.05, subsample 0.8
- **Training**: `TimeSeriesSplit` (3 splits) on historical Agmarknet data from PostgreSQL; requires 50+ samples
- **17 features**:
  - Price lags (1, 7, 14, 30 day)
  - Moving averages (7, 14, 21 day)
  - Price momentum, price volatility
  - Arrival quantity + 7-day avg
  - Seasonality (month_sin, month_cos, day_of_week)
  - Weather (avg_temp, rainfall_7d, humidity)
- **Output**: day-by-day forecasts with confidence intervals (CI = ±2σ based on volatility)
- **Fallback**: statistical forecast (weighted moving average with momentum)
- **Persistence**: pickle models to `ml/saved_models/price_{crop}.pkl`

### 5.5 SpoilageModel (v2 — DB-backed)

- **Location**: `agrichain-backend/ml/spoilage_model.py`
- **Algorithm**: Physics-informed composite model
- **5 factors** (weighted):
  | Factor | Weight | Source |
  |---|---|---|
  | Temperature stress | 40% | WeatherRecord (Q10 exponential damage rule) |
  | Humidity stress | 20% | WeatherRecord |
  | Transit damage | 20% | TransportRoute (time + road + distance) |
  | Time decay | 15% | Shelf life ratio (exponential at >80%) |
  | Crop health (NDVI) | 5% | NDVIRecord (low NDVI = stressed = higher loss) |
- **Modifiers**: storage_type multiplier (0.2–1.5), packaging multiplier (0.4–1.3)
- **Formula**: `spoilage_pct = FAO_base_rate × env_multiplier × storage_mult × packaging_mult`
- **Output**: spoilage_pct, risk_level, loss_estimate_kg, shelf_life_remaining, factor breakdown, actionable recommendations
- **Batch mode**: `batch_predict()` across multiple districts

### 5.6 HarvestModel (v2 — DB-backed)

- **Location**: `agrichain-backend/ml/harvest_model.py`
- **Algorithm**: Multi-signal decision system
- **5 signals**:
  1. **Maturity calendar** — days since sowing vs crop maturity range (from CropMeta)
  2. **NDVI growth curve** — plateau/decline = maturity (from NDVIRecord + Sentinel-2)
  3. **Weather risk** — rainfall patterns, humidity, wind speed (from WeatherRecord)
  4. **Price timing** — 30-day price trend analysis (rising/falling/stable from MandiPrice)
  5. **Composite decision** — priority: over-mature → weather → maturity → price
- **Decision priority**:
  - Over-mature → `urgent_harvest` (critical)
  - Not mature → `wait` N days
  - Rain risk → `wait` 3 days
  - Prices rising + mature → `wait` up to shelf_life/2 days
  - Default (mature + good weather) → `harvest_now`
- **Confidence**: 0.5 base + 0.15 per available signal (maturity, NDVI, weather)

### 5.7 RecommendationEngine (v2)

- **Location**: `agrichain-backend/ml/recommendation_engine.py`
- **Formula**: `Net Profit = (Predicted Price × Qty) − Transport Cost − Spoilage Loss`
- **Process**: For each candidate mandi:
  1. Price prediction via `PricePredictor`
  2. Transport cost from `TransportRoute` DB
  3. Spoilage loss via `SpoilageModel` (with destination-specific transit)
  4. Net profit calculation
- **Ranking**: sort by net profit descending
- **Default mandis** per district (e.g., Nashik → [nashik, pune, mumbai])
- **Output**: ranked list with price, transport breakdown, spoilage risk, profit margin, human-readable summary
- **`quick_recommend()`**: simplified top-3 for mobile frontend

### 5.8 Decision Engine (Legacy)

- **Location**: `agrichain-backend/decision_engine.py`
- Combines `price_trend`, `harvest_window`, `spoilage_risk` model outputs
- **Rules**: extreme_weather → sell_immediately; rising + low_spoilage → wait; falling or high/critical spoilage → sell_immediately
- **Smart mandi selection**: if best mandi >95km AND transport cost > price differential → fallback to local mandi
- **Preservation actions** builder (3 tiers: sell now / cold storage / grade + warehouse)
- **Overall confidence**: average of 3 model confidences, clamped 0.50–0.95

### 5.9 Explainability Engine

- **Location**: `agrichain-backend/explainability_engine.py`
- Generates human-readable reasons for recommendations:
  - **Weather reason**: rain in 3 days → harvest early; temp >35 → spoilage risk; else stable window
  - **Market reason**: rising → wait for better rates; falling → sell soon; high arrivals → oversupply warning
  - **Supply reason**: high → 15-20% price reduction; low → less competition, good time
  - **Confidence message**: >0.75 high, >0.55 medium (limited data), else low (regional averages)

---

## 6. Database Models

**ORM**: SQLAlchemy 2.x | **DB**: SQLite (dev) / PostgreSQL (prod)

### 6.1 MandiPrice

| Column | Type | Description |
|---|---|---|
| id | Integer PK | Auto-increment |
| commodity | String | Crop name (lowercase) |
| state | String | State name |
| district | String | District name (lowercase) |
| market | String | Mandi/market name |
| variety | String (nullable) | Crop variety |
| arrival_date | Date | Date of price record |
| min_price | Float | Minimum price (₹/quintal) |
| max_price | Float | Maximum price |
| modal_price | Float | Modal (most common) price |
| arrival_qty_tonnes | Float | Arrival quantity in tonnes |

### 6.2 WeatherRecord

| Column | Type | Description |
|---|---|---|
| id | Integer PK | — |
| district | String | District (lowercase) |
| state | String | State |
| lat, lon | Float | Coordinates |
| record_date | Date | — |
| temp_min, temp_max, temp_avg | Float | Temperature (°C) |
| humidity | Float | Relative humidity (%) |
| rainfall_mm | Float | Daily rainfall |
| solar_radiation | Float | Solar irradiance (kWh/m²/day) |
| wind_speed | Float | Wind speed (m/s) |
| source | String | Data source (nasa_power / openweathermap) |

### 6.3 SoilProfile

| Column | Type | Description |
|---|---|---|
| id | Integer PK | — |
| district | String | — |
| soil_type | String | ICAR classification |
| ph | Float | Soil pH |
| organic_carbon | Float | OC (%) |
| nitrogen, phosphorus, potassium | Float | N, P, K (kg/ha) |
| soil_quality_index | Float | Composite quality score |

### 6.4 NDVIRecord

| Column | Type | Description |
|---|---|---|
| id | Integer PK | — |
| lat, lon | Float | Coordinates |
| district | String | — |
| record_date | Date | — |
| ndvi_value | Float | NDVI (-1 to 1) |
| trend_30d | Float | 30-day trend slope |
| growth_plateau | Boolean | Plateau flag (maturity indicator) |
| source | String | Sentinel-2 |

### 6.5 CropMeta

| Column | Type | Description |
|---|---|---|
| id | Integer PK | — |
| crop | String | Crop name (lowercase) |
| category | String | vegetable / grain / fruit / oilseed / cash_crop |
| maturity_days_min, maturity_days_max | Integer | Harvest window range |
| shelf_life_days | Integer | Post-harvest shelf life |
| optimal_temp_min, optimal_temp_max | Float | Ideal storage temp (°C) |
| optimal_humidity_min, optimal_humidity_max | Float | Ideal humidity (%) |
| fao_loss_pct | Float | FAO post-harvest loss baseline (%) |
| base_price_per_quintal | Float | Reference wholesale price |

### 6.6 TransportRoute

| Column | Type | Description |
|---|---|---|
| id | Integer PK | — |
| origin | String | Origin district (lowercase) |
| destination | String | Destination mandi (lowercase) |
| distance_km | Float | Route distance |
| typical_hours | Float | Transit time |
| road_quality | String | good / moderate / poor |
| fuel_cost_per_km | Float | Fuel cost estimate |
| spoilage_rate_pct_per_hr | Float | En-route spoilage rate |

### 6.7 User

| Column | Type | Description |
|---|---|---|
| id | Integer PK | — |
| phone | String (unique, indexed) | Login identifier |
| password_hash | String | bcrypt hash |
| full_name | String | — |
| district | String (nullable) | — |
| state | String (default: Maharashtra) | — |
| main_crop | String (nullable) | Primary crop |
| farm_size_acres | Float (nullable) | — |
| soil_type | String (nullable) | — |
| language | String (default: hi) | Preferred language |
| total_harvests | Integer (default: 0) | Activity counter |
| savings_estimate | Float (default: 0.0) | Estimated ₹ saved |

### 6.8 PredictionLog

| Column | Type | Description |
|---|---|---|
| id | Integer PK | — |
| prediction_type | String | harvest / mandi / spoilage |
| crop | String | — |
| district | String | — |
| input_json | JSON | Request payload |
| output_json | JSON | Model output |
| confidence | Float | Model confidence |
| model_version | String | — |
| data_sources | String | Which data sources contributed |

### Seed Data (`seed.py`)

- **3 demo users**: Prem Kumar (Nashik/Onion), Bhumi Devi (Pune/Tomato), Ashwin Patil (Nagpur/Wheat)
- **10 crops** with FAO post-harvest loss data (range 5–38%, highest for tomato/grape)
- **10 Maharashtra district soil profiles** (ICAR data with pH, OC, NPK values)
- **16+ transport routes** between districts and mandis (with distance, time, road quality, fuel cost)

---

## 7. Services Layer

### 7.1 apiService.js (Frontend — Primary API Client)

- **Base URL**: `EXPO_PUBLIC_BACKEND_URL` or `http://localhost:8000`
- **Timeout**: 15 seconds
- **Cache**: AsyncStorage with 24-hour TTL, key format: `agrimitra_api_cache_v1:{endpoint}:{crop}::{district}`
- **3-tier fallback strategy**:
  1. Network request to backend
  2. Cached response from AsyncStorage
  3. Client-side mock data (rule-based models built into JS)
- **Exported functions**:
  - `checkApiHealth()` — health check
  - `getHarvestRecommendation()` — POST `/predict/harvest`
  - `getMandiRecommendation()` — POST `/predict/mandi`
  - `getSpoilageRisk()` — POST `/predict/spoilage`
  - `getExplanation()` — POST `/explain/recommendation`
  - `getFullAdvisory()` — POST `/intelligence/full-advisory`
  - `getPriceForecast()` — POST `/intelligence/price-forecast`
  - `getMandiRecommendationV2()` — POST `/intelligence/mandi-recommend`
  - `getSpoilageRiskV2()` — POST `/intelligence/spoilage-risk`
  - `getHarvestWindowV2()` — POST `/intelligence/harvest-window`
  - `getDataStatus()` — GET `/intelligence/data-status`
  - `formatCurrency()`, `classifyConfidence()`
- **Mock data builders**: `buildHarvestMock()`, `buildMandiMock()`, `buildSpoilageMock()`, `buildExplainMock()` — use crop maturity days + base prices + storage risk constants built into the frontend
- **Response metadata**: every response wrapped with `_meta: {source, usedCache, usedMock, banner, timestamp}`

### 7.2 recommendationService.js (Frontend — Client-Side Recommendation)

- **Independent recommendation engine** that runs entirely on-device
- Calls **OpenWeatherMap OneCall 3.0** and **Agmarknet API** directly from frontend
- **Functions**:
  - `fetchWeatherForecast(district)` — 7-day forecast from OpenWeatherMap
  - `fetchMandiData(crop, district)` — real-time prices from data.gov.in
  - `calculateHarvestWindow(formData, weather)` — maturity days adjusted for rain cutoff
  - `buildRevenueSummary(formData, mandi)` — distance (Haversine), transport cost, local vs mandi revenue
  - `buildReasonPoints(...)` — 3 human-readable reason icons+texts
  - `getRecommendation(formData)` — master function, `Promise.allSettled` for parallel weather+mandi fetch
- **Fallback**: `buildMockWeather()` / `buildMockMandi()` with district-shifted patterns
- Haversine distance calculation for 7 Maharashtra districts

### 7.3 intelligenceService.js (Frontend — v2 API Wrapper)

- **High-level wrapper** for v2 `/intelligence` endpoints
- Tries new unified `getFullAdvisory()` first, falls back to calling legacy endpoints individually via `Promise.all`
- Exports: `getIntelligence()`, `getSmartPriceForecast()`, `getSmartMandiRecommendation()`, `getSmartSpoilageRisk()`, `getSmartHarvestWindow()`, `checkDataPipeline()`

### 7.4 ariaService.js (Frontend — ARIA Chat Service)

- **Gemini 2.0 Flash** for chat responses
- System prompt: ARIA persona — simple Hindi/Hinglish, max 3 sentences, always ends with clear action
- Context-aware: includes crop, district, risk category, last recommendation
- `fetchAriaReply({uiMessages, context, languageCode})` — sends last 10 messages + system prompt to Gemini
- `getAriaFallbackReply(lang)` — offline fallback in hi/en/mr
- `transcribeWithWhisper()` — stub (text input fallback)
- Temperature: 0.35, maxOutputTokens: 180

### 7.5 ariaVoiceEngine.js (Frontend — Voice + Intent)

- **Recording**: expo-av (lazy-loaded for Expo Go safety)
- **Transcription**: Gemini 2.0 Flash multimodal (audio base64 → text), temperature 0.0
- **Wake word detection**: "Hi Aria" / "Hey Aria" / "हाय आरिया" etc. (8 strict regex + 1 loose)
- **Intent parsing** (2-tier):
  1. **Local keyword matching**: 13 intent patterns with Hindi/English/Hinglish keywords → instant response
  2. **Gemini NLU fallback**: complex/multilingual → structured JSON intent parsing
- **Intent types**: navigate (8 screens), fetch (5 data actions), stop, chat
- **TTS**: expo-speech with hi-IN / en-IN / mr-IN at rate 0.95

### 7.6 notificationService.js (Frontend — Push Notifications)

- **Expo Go detection**: skips push notifications in Expo Go (not supported SDK 53+)
- **Android channel**: `agrimitra-alerts` (HIGH importance, vibration, green light)
- Permission request flow
- **Demo notifications**:
  - T+60s: Price alert ("Nashik मंडी में Onion का भाव 12% बढ़ा")
  - T+5min: Weather alert ("कल बारिश आने वाली है")

### 7.7 weather_service.py (Backend)

- **OpenWeatherMap** 5-day/3-hour forecast API
- Parses: temp_min, temp_max, humidity, rainfall, rain_in_3/7days, extreme_weather_flag
- **TTLCache**: 6 hours
- **Fallback**: district-specific climatology profiles for 7 Maharashtra districts (Nashik, Pune, Aurangabad, Nagpur, Solapur, Kolhapur, Amravati)
- Hindi weather alerts: rain, heat, extreme weather, clear

### 7.8 mandi_service.py (Backend)

- **Agmarknet API** (data.gov.in) for real-time Maharashtra mandi prices
- Computes: 7/14/21-day moving averages, price momentum (rising/falling/stable), arrival pressure (low/normal/high)
- **Best mandi selection**: highest modal price from recent records
- **Transport cost estimation**: Haversine distance × ₹28.5/km
- **Neighbor intelligence**: simulated farmer count + supply level + recommendation
- **TTLCache**: 6 hours
- **Fallback**: base crop prices dictionary

### 7.9 feature_engineering.py (Backend)

- `build_features()`: combines weather + mandi + crop metadata into unified feature dict
- Computed fields: shelf_life_remaining, spoilage_susceptibility, net_profit_best_mandi, net_profit_local, estimated_distance_km, transport_cost_estimate
- Used by the legacy `/predict` pipeline

---

## 8. Authentication System

### Backend (JWT)

- **Algorithm**: HS256
- **Token expiry**: 30 days (ACCESS_TOKEN_EXPIRE_MINUTES = 43200)
- **Password hashing**: bcrypt via `passlib.context.CryptContext`
- **Secret key**: configurable via `SECRET_KEY` env var
- **Token payload**: `{"sub": user.phone}`
- **Dependency**: `get_current_user()` extracts phone from JWT, queries DB

### Frontend (AuthContext)

- **Token storage**: AsyncStorage (`@agrimitra_auth_token` + `@agrimitra_auth_user`)
- **Session restore**: on mount, reads stored token + user, validates via `GET /auth/me`
- **Token attachment**: axios interceptor sets `Authorization: Bearer {token}` header
- **Expired token handling**: clears session, user must re-login
- **Exposed API**: `register()`, `login()`, `logout()`, `updateProfile()`, `changePassword()`, `refreshProfile()`
- **State**: `user`, `token`, `loading`, `isAuthenticated`

### Guest Mode

- Skip login → navigate directly to MainTabs
- Limited features (no saved profile, no harvests tracking)
- Profile screen shows login/register prompt

---

## 9. Internationalization (i18n)

### Languages Supported

| Code | Language | Default |
|---|---|---|
| `hi` | Hindi | ✅ (default) |
| `en` | English | |
| `mr` | Marathi | |

### Implementation

- **LanguageContext**: React Context provider wrapping entire app
- **Persistence**: AsyncStorage (`@agrimitra_language`)
- **Translation function**: `t(key, params)` — supports parameter interpolation (`{{count}}`, `{{district}}`, etc.)
- **Translation files**: `src/i18n/en.js`, `src/i18n/hi.js`, `src/i18n/mr.js`
- **Coverage**: 425+ keys in English covering all screens
- **Categories**:
  - `common.*` — shared UI strings (loading, error, retry, currency, etc.)
  - `tabs.*` — bottom tab labels
  - `home.*` — home screen cards and greetings
  - `market.*` — mandi price screen
  - `disease.*` — disease scanner (22+ disease names translated)
  - `profile.*` — profile screen
  - `alerts.*` — alert types and messages
  - `schemes.*` — government schemes
  - `cropInput.*` — crop input form
  - `recommendation.*` — recommendation screen
  - `spoilage.*` — spoilage risk checker
  - `aria.*` — ARIA voice assistant

### Language Switcher

- Available on HomeScreen and ProfileScreen
- Pill-style selector with active highlight
- Immediate UI update across all screens

---

## 10. ETL Pipelines

### ETL Scheduler (`etl/scheduler.py`)

Uses **APScheduler AsyncIOScheduler** with 3 scheduled jobs:

| Job | Trigger | Schedule | Description |
|---|---|---|---|
| `mandi_daily_sync` | CronTrigger | Daily at 6 AM IST (00:30 UTC) | Fetch latest mandi prices |
| `weather_daily_sync` | CronTrigger | Daily at 7 AM IST (01:30 UTC) | Fetch weather data (7-day incremental) |
| `ndvi_weekly_sync` | CronTrigger | Sunday at 8 AM IST (02:30 UTC) | Fetch NDVI satellite data (30-day window) |

- **Initial sync on startup**: if MandiPrice or WeatherRecord tables are empty, runs full historical sync (mandi: all crops; weather: 90 days back; NDVI: 60 days back)
- **Status endpoint**: scheduler health with job list and last-run times

### MandiETL (`etl/mandi_etl.py`)

- **Source**: Agmarknet API (data.gov.in)
- **Target crops**: 10 (Onion, Tomato, Wheat, Rice, Potato, Soyabean, Cotton, Grape, Banana, Sugarcane)
- **Target districts**: 10 Maharashtra districts
- **Pipeline**: fetch → transform (normalize, parse dates, lowercase) → load (skip duplicates via IntegrityError)
- **Full sync**: 1000 records per crop per call

### WeatherETL (`etl/weather_etl.py`)

- **Source**: NASA POWER API (free, no key required)
- **Parameters**: T2M, T2M_MIN, T2M_MAX, RH2M, PRECTOTCORR, ALLSKY_SFC_SW_DWN, WS2M
- **Coverage**: 10 Maharashtra districts with precise coordinates
- **Missing data handling**: NASA POWER -999.0 → NULL
- **Community**: "AG" (Agriculture)
- **Default sync**: 90 days back (full), 7 days (daily incremental)

### NDVI ETL (`etl/ndvi_etl.py`)

- Sentinel-2 satellite vegetation index data
- Tracks: NDVI value, 30-day trend slope, growth plateau flag
- 60-day sync window on startup, 30-day weekly

---

## 11. ARIA Voice Assistant

### Architecture

ARIA is a **multi-modal AI assistant** that works across three layers:

1. **AriaContext** (React Context — state machine):
   - 7 modes: `IDLE`, `WAKE_LISTENING`, `ACTIVATED`, `LISTENING`, `PROCESSING`, `SPEAKING`, `EXECUTING`
   - Wake word loop (3.5s recording chunks)
   - Command recording (max 10s)
   - Auto-dismiss overlay after 2.5s

2. **ariaVoiceEngine.js** (pure functions):
   - Audio recording (expo-av, lazy-loaded)
   - Gemini multimodal transcription (audio base64 → text)
   - Wake word detection (regex: "Hi Aria", "Hey Aria", Hindi variants)
   - 2-tier intent parsing (local keywords → Gemini NLU)
   - Text-to-speech (expo-speech)

3. **ariaService.js** (Gemini chat):
   - Context-aware conversational AI
   - System prompt defines ARIA persona
   - Supports Hindi, English, Marathi

### Voice Flow

```
User taps mic → LISTENING → record audio → PROCESSING
    ↓
Gemini transcription (audio → text)
    ↓
Wake word check → extract command
    ↓
Intent parsing:
  ├── Local keyword match? → instant response
  └── No match → Gemini NLU → structured JSON intent
    ↓
Execute action:
  ├── navigate → open screen
  ├── fetch → call API → speak result
  ├── stop → dismiss
  └── chat → speak Gemini response
    ↓
SPEAKING (expo-speech TTS) → auto-dismiss → IDLE
```

### Wake Word Detection

- **Active listening loop**: records 3.5s chunks, transcribes, checks for wake word
- **Patterns**: "Hi Aria", "Hey Aria", "Hai Ariya", "Ok Aria", "हाय आरिया", "हाई आरिया"
- **On detection**: activates ("Haan, bolo?") → waits for command

### Intent Map (13 intents)

| Intent | Action | Keywords (sample) |
|---|---|---|
| navigate:Market | Show mandi prices | mandi, price, भाव, rate, बाज़ार |
| navigate:Disease | Open camera | disease, scan, बीमारी, pest |
| navigate:Schemes | Govt schemes | scheme, yojana, योजना, subsidy |
| navigate:CropInput | Crop details | crop input, फसल दर्ज |
| navigate:Spoilage | Storage risk | spoilage, खराब, storage |
| navigate:Alerts | Notifications | alert, अलर्ट, सूचना |
| fetch:price_forecast | Price prediction | price forecast, भाव बताओ |
| fetch:harvest | Harvest timing | harvest, कटाई, कब काटूं |
| fetch:weather | Weather info | weather, मौसम, बारिश |
| fetch:best_mandi | Best mandi | best mandi, कहाँ बेचूं |
| fetch:full_advisory | Complete advice | full advice, सलाह, recommendation |
| stop | Close assistant | stop, bye, बंद, shukriya |
| chat (fallback) | General Q&A | (anything unmatched → Gemini) |

### AriaScreen (Chat UI)

- Text input + send button + press-and-hold mic
- Message bubbles (user green, assistant white with green left border)
- Quick reply chips for follow-up questions
- Language pills (hi/en/mr) at header
- Animated speaking overlay with wave bars
- Suggested questions in empty state

### AriaOverlay (Persistent Component)

- Renders on top of all screens
- Shows mode indicator (listening / processing / speaking)
- Tap to dismiss or interrupt

---

## 12. Notable Features & Design Patterns

### 12.1 Three-Tier Fallback Strategy

Every API call follows: **Network → Cache → Mock**
- Network: hit FastAPI backend
- Cache: AsyncStorage with TTL (24hrs API, 30min market)
- Mock: client-side rule-based models that produce realistic predictions offline
- Response includes `_meta.source` so UI can show "📵 Offline" or "📴 Using cached data" banners

### 12.2 Dual Recommendation Pipeline

Two independent recommendation systems:
1. **Backend pipeline** (apiService → FastAPI → ML models) — production-grade, DB-backed
2. **Frontend pipeline** (recommendationService → OpenWeatherMap + Agmarknet APIs) — runs entirely on-device with direct API calls

The frontend gracefully falls back between them.

### 12.3 Dual Model Architecture (Legacy v1 + v2)

- **v1 (`/predict`)**: Rule-based + lightweight sklearn models, inline-trained on synthetic data. Works without database.
- **v2 (`/intelligence`)**: Full ML models (GradientBoosting, physics-informed spoilage, multi-signal harvest) trained on real historical data from PostgreSQL.
- Frontend tries v2 first (`intelligenceService`) → falls back to v1 → falls back to client-side mocks.

### 12.4 Neighbor Intelligence

- Simulated "social proof" feature: "432 किसान selling onion in Nashik this week"
- Supply level detection (low/normal/high)
- Sell/wait recommendation based on competitor behavior

### 12.5 Explainable AI

- Every recommendation comes with human-readable reasons (weather, market, supply)
- Expandable "Why this recommendation?" section in UI
- Confidence levels with color coding (green=high, yellow=medium, orange=regional averages)

### 12.6 Multi-Language Voice AI

- ARIA supports Hindi, English, Marathi for both input and output
- Text-to-speech in all 3 languages (hi-IN, en-IN, mr-IN)
- Wake word detection handles Hindi transliterations
- Gemini NLU understands code-mixed Hindi-English (Hinglish)

### 12.7 Preservation Action Economics

- Post-harvest recommendations include cost-benefit analysis:
  - Cost per quintal for each action
  - Percentage of stock saved
  - "Find Cold Storage" button opens Google Maps

### 12.8 Satellite Data Integration (NDVI)

- Sentinel-2 NDVI satellite imagery for crop health monitoring
- Growth plateau detection as maturity signal
- Weekly ETL pipeline for automated updates

### 12.9 Government Scheme Discovery

- AI-powered scheme search via Google Gemini
- Auto-detects state from GPS
- Shows eligibility, benefit amount, deadline countdown
- "Apply Now" deep-links to official application portals

### 12.10 FAO-Calibrated Spoilage Data

- Post-harvest loss baselines from FAO Technical Papers
- ICAR soil data for 10 Maharashtra districts
- Temperature damage modeled with Q10 biological rule
- Transport spoilage rates from TransportRoute database

### 12.11 Configuration Management

- **Backend**: Pydantic Settings with `.env` file support
- **Environment variables**:
  | Variable | Description |
  |---|---|
  | `DATABASE_URL` | DB connection (default: sqlite:///agrimitra.db) |
  | `SECRET_KEY` | JWT signing key |
  | `OPENWEATHER_API_KEY` | Weather API |
  | `DATAGOV_API_KEY` | Agmarknet mandi data |
  | `GOOGLE_API_KEY` | Gemini AI |
  | `HF_TOKEN` | HuggingFace inference |
  | `EXPO_PUBLIC_BACKEND_URL` | Frontend API base URL |

### 12.12 Maharashtra Focus

The entire system is tuned for Maharashtra state:
- **10 districts**: Nashik, Pune, Nagpur, Aurangabad, Solapur, Kolhapur, Amravati, Jalgaon, Sangli, Ahmednagar
- ICAR soil profiles per district
- District-specific weather climatology fallbacks
- Transport routes between actual Maharashtra mandis
- Default mandis: real mandi relationships (e.g., Nashik → [Nashik, Pune, Mumbai])

---

## File Map

```
d:\beadsheet/
├── AgriChain/                          # React Native Frontend
│   ├── App.js                          # Root component, navigation, context providers
│   ├── package.json                    # Dependencies
│   ├── src/
│   │   ├── components/
│   │   │   ├── AriaOverlay.js          # Persistent voice assistant overlay
│   │   │   ├── LanguageSwitcher.js     # Language selection pills
│   │   │   └── WeatherBanner.js        # Current weather display
│   │   ├── context/
│   │   │   ├── AriaContext.js          # ARIA voice state machine (457 lines)
│   │   │   ├── AuthContext.js          # JWT auth context (165 lines)
│   │   │   └── LanguageContext.js      # Language provider (65 lines)
│   │   ├── data/
│   │   │   ├── agriOptions.js          # Crops, districts, coordinates, prices
│   │   │   └── marketData.js           # Fallback market price data
│   │   ├── i18n/
│   │   │   ├── en.js                   # English translations (425 lines)
│   │   │   ├── hi.js                   # Hindi translations
│   │   │   ├── mr.js                   # Marathi translations
│   │   │   └── index.js               # translate() function
│   │   ├── screens/
│   │   │   ├── AlertsScreen.js
│   │   │   ├── AriaScreen.js           # AI chat UI (783 lines)
│   │   │   ├── CropInputScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── DiseaseScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── MarketScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   ├── RecommendationScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── SchemesScreen.js
│   │   │   └── SpoilageScreen.js
│   │   ├── services/
│   │   │   ├── apiService.js           # API client with 3-tier fallback (563 lines)
│   │   │   ├── ariaService.js          # Gemini chat API
│   │   │   ├── ariaVoiceEngine.js      # Voice recording, transcription, intent (426 lines)
│   │   │   ├── intelligenceService.js  # v2 API wrapper
│   │   │   ├── notificationService.js  # Push notification setup
│   │   │   └── recommendationService.js # Client-side recommendation engine (382 lines)
│   │   └── theme/
│   │       └── colors.js               # Color constants
│
├── agrichain-backend/                  # FastAPI Backend
│   ├── main.py                         # App factory, lifespan, router mounting
│   ├── requirements.txt                # Python dependencies
│   ├── pytest.ini                      # Test configuration
│   ├── decision_engine.py              # Legacy decision combiner
│   ├── explainability_engine.py        # Human-readable explanations
│   ├── core/
│   │   ├── config.py                   # Pydantic Settings
│   │   ├── exceptions.py               # Custom exceptions
│   │   ├── logging.py                  # structlog setup
│   │   └── middleware.py               # CORS, rate limiting
│   ├── db/
│   │   ├── models.py                   # 8 SQLAlchemy models
│   │   ├── seed.py                     # Demo data seeder
│   │   └── session.py                  # DB session factory
│   ├── etl/
│   │   ├── mandi_etl.py               # Agmarknet price ETL (210 lines)
│   │   ├── ndvi_etl.py                 # Sentinel-2 NDVI ETL
│   │   ├── scheduler.py               # APScheduler ETL jobs
│   │   └── weather_etl.py             # NASA POWER weather ETL (293 lines)
│   ├── ml/
│   │   ├── harvest_model.py            # v2 harvest optimizer (513 lines)
│   │   ├── price_predictor.py          # v2 XGBoost price forecast (485 lines)
│   │   ├── recommendation_engine.py    # v2 mandi ranker (374 lines)
│   │   └── spoilage_model.py           # v2 physics-informed spoilage (458 lines)
│   ├── models/
│   │   ├── harvest_window_model.py     # v1 rule-based harvest
│   │   ├── price_trend_model.py        # v1 calibrated logistic regression
│   │   └── spoilage_risk_model.py      # v1 rule-based spoilage
│   ├── routers/
│   │   ├── auth.py                     # Auth endpoints
│   │   ├── disease.py                  # Disease scan proxy
│   │   ├── intelligence.py             # v2 ML endpoints (340 lines)
│   │   ├── market.py                   # Market prices
│   │   ├── predict.py                  # v1 prediction pipeline
│   │   ├── schemes.py                  # Govt schemes
│   │   └── weather.py                  # Weather API
│   ├── services/
│   │   ├── feature_engineering.py      # Feature vector builder
│   │   ├── mandi_service.py            # Agmarknet API client
│   │   └── weather_service.py          # OpenWeatherMap client
│   └── tests/
│       └── test_api.py                 # API tests
│
└── scripts/
    └── setup_dev.py                    # Development environment setup
```

---

*Generated from complete source code analysis of 50+ files across the AGRI-मित्र project.*
