# AGRI-मित्र Backend

> **FastAPI-based AI-powered post-harvest advisory API**

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example .env

# Run development server
python main.py
```

## API Endpoints

### Health & Status
- `GET /` - API info
- `GET /health` - Health check with service status
- `GET /ready` - Readiness probe

### Predictions
- `POST /predict/harvest` - Harvest timing prediction
- `POST /predict/mandi` - Best mandi recommendation
- `POST /predict/spoilage` - Spoilage risk assessment
- `POST /predict/explain` - Decision explanation

### Data APIs
- `GET /api/weather/{district}` - Weather data
- `GET /api/market/prices` - Mandi prices
- `POST /api/disease/scan` - Disease detection
- `GET /api/schemes` - Government schemes

## Configuration

All configuration is done via environment variables. See `../.env.example` for the full list.

### Required for full functionality:
- `OPENWEATHER_API_KEY` - Weather data
- `DATAGOV_API_KEY` - Mandi prices
- `GOOGLE_API_KEY` - AI features
- `HF_TOKEN` - Disease detection

## Development

```bash
# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest --cov=.

# Format code
black .
ruff check --fix .
```

## Docker

```bash
# Build image
docker build -t agrimitra-api .

# Run container
docker run -p 8000:8000 --env-file ../.env agrimitra-api
```

## Project Structure

```
agrichain-backend/
├── core/               # Core modules
│   ├── config.py       # Settings management
│   ├── logging.py      # Structured logging
│   ├── exceptions.py   # Error handling
│   └── middleware.py   # Request middleware
├── routers/            # API endpoints
│   ├── predict.py      # Prediction endpoints
│   ├── weather.py      # Weather API
│   ├── market.py       # Market API
│   ├── disease.py      # Disease detection
│   └── schemes.py      # Govt schemes
├── services/           # External integrations
│   ├── weather_service.py
│   ├── mandi_service.py
│   └── feature_engineering.py
├── models/             # ML models
│   ├── harvest_window_model.py
│   ├── price_trend_model.py
│   └── spoilage_risk_model.py
├── main.py             # Application entry
└── requirements.txt    # Dependencies
```
