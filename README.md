# 🌾 AgriChain

> **AI-Powered Post-Harvest Advisory System for Indian Farmers**

AgriChain is a comprehensive agricultural technology solution that helps Indian farmers make informed decisions about harvest timing, market selection, storage, and crop health management. The system combines real-time market data, weather intelligence, and AI-powered predictions to maximize farmer profits while minimizing post-harvest losses.

---

## ✨ Features

### 📅 **Harvest Advisor**
- Optimal harvest timing predictions based on crop maturity, weather, and market conditions
- Weather-adjusted recommendations (rain alerts, extreme temperature warnings)
- Price trend analysis to maximize selling price

### 📊 **Mandi Price Intelligence**
- Real-time prices from major mandis across Maharashtra
- 30-day price history charts with trend analysis
- Neighbor farmer intelligence (supply competition alerts)
- Best mandi recommendations with transport cost calculations

### 📦 **Spoilage Risk Assessment**
- Storage condition analysis (open field, warehouse, cold storage)
- Transit time impact predictions
- Temperature and humidity risk factors
- Preservation action recommendations with cost-benefit analysis

### 🔬 **Disease Detection**
- AI-powered crop disease identification using camera/gallery images
- Disease name in Hindi and English
- Treatment recommendations ranked by cost-effectiveness
- Impact assessment on harvest timeline

### 🏛️ **Government Schemes**
- Personalized scheme recommendations based on crop and location
- Eligibility checking and application guidance
- Deadline tracking for time-sensitive schemes

### 🎤 **ARIA Voice Assistant**
- Multilingual support (Hindi, English, Marathi)
- Context-aware farming advice
- Voice input and text-to-speech output
- Powered by Google Gemini AI

---

## 🏗️ Architecture

```
agrichain/
├── AgriChain/              # React Native Expo Mobile App
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── services/       # API and business logic
│   │   ├── data/           # Static data and mocks
│   │   └── theme/          # Colors and styling
│   ├── assets/             # Images and fonts
│   └── App.js              # App entry point
│
├── agrichain-backend/      # FastAPI Python Backend
│   ├── core/               # Core modules (config, logging, errors)
│   ├── routers/            # API endpoints
│   ├── services/           # External API integrations
│   ├── models/             # ML prediction models
│   └── main.py             # Application entry point
│
├── docker-compose.yml      # Development orchestration
├── docker-compose.prod.yml # Production overrides
└── .env.example            # Environment template
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **Expo CLI**: `npm install -g @expo/cli`
- **Docker** (optional, for containerized deployment)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd agrichain

# Copy environment files
cp .env.example .env
cp AgriChain/.env.example AgriChain/.env
```

### 2. Configure Environment Variables

Edit `.env` with your API keys:

```env
# Required for weather data
OPENWEATHER_API_KEY=your_api_key

# Required for mandi prices (optional - falls back to mock data)
DATAGOV_API_KEY=your_api_key

# Required for ARIA assistant and schemes
GOOGLE_API_KEY=your_gemini_api_key

# Required for disease detection
HF_TOKEN=your_huggingface_token
```

### 3. Start Backend

```bash
cd agrichain-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py
```

The API will be available at `http://localhost:8000`

### 4. Start Mobile App

```bash
cd AgriChain

# Install dependencies
npm install

# Update .env with backend URL
# EXPO_PUBLIC_BACKEND_URL=http://YOUR_LOCAL_IP:8000

# Start Expo
npx expo start
```

Scan the QR code with Expo Go app on your phone.

---

## 🐳 Docker Deployment

### Development

```bash
# Start all services
docker-compose up

# Rebuild after changes
docker-compose up --build
```

### Production

```bash
# Build and start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api
```

---

## 📡 API Documentation

When running in development mode, access the API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with service status |
| `/predict/harvest` | POST | Harvest timing prediction |
| `/predict/mandi` | POST | Best mandi recommendation |
| `/predict/spoilage` | POST | Spoilage risk assessment |
| `/api/weather/{district}` | GET | Weather data for district |
| `/api/market/prices` | GET | Live mandi prices |
| `/api/disease/scan` | POST | Disease detection from image |
| `/api/schemes` | GET | Government scheme recommendations |

---

## 🔧 Configuration

### Backend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `API_HOST` | Server bind host | 0.0.0.0 |
| `API_PORT` | Server port | 8000 |
| `LOG_LEVEL` | Logging level | INFO |
| `CORS_ORIGINS` | Allowed CORS origins | * |
| `RATE_LIMIT_REQUESTS` | Rate limit per minute | 60 |

### Mobile App Configuration

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_BACKEND_URL` | Backend API URL |
| `EXPO_PUBLIC_GOOGLE_API_KEY` | Gemini API key for ARIA |
| `EXPO_PUBLIC_HF_TOKEN` | HuggingFace token for disease detection |

---

## 📱 Building for Production

### Android APK

```bash
cd AgriChain
npx eas build --platform android --profile preview
```

### iOS Build

```bash
cd AgriChain
npx eas build --platform ios --profile preview
```

---

## 🧪 Testing

### Backend Tests

```bash
cd agrichain-backend
pytest --cov=.
```

### Frontend Tests

```bash
cd AgriChain
npm test
```

---

## 🔒 Security Considerations

1. **Never commit `.env` files** - Use `.env.example` as template
2. **API keys** - Keep all API keys in environment variables
3. **CORS** - Configure specific origins in production
4. **Rate limiting** - Enabled by default (60 req/min)
5. **HTTPS** - Use HTTPS in production deployments
6. **Input validation** - All inputs validated with Pydantic

---

## 📊 Monitoring

The backend provides several endpoints for monitoring:

- `/health` - Service health and dependency status
- `/ready` - Kubernetes readiness probe
- Structured JSON logging in production mode

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Market data from [data.gov.in](https://data.gov.in/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Disease detection model from [HuggingFace](https://huggingface.co/)

---

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for Indian farmers**
