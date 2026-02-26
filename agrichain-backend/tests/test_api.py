"""
AgriChain API Tests
═══════════════════════════════════════════════════════════════════════════════

Basic tests for API endpoints and health checks.
"""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


class TestHealthEndpoints:
    """Test health and status endpoints."""

    def test_root_endpoint(self, client):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "AgriChain API"
        assert data["status"] == "running"
        assert "version" in data

    def test_health_check(self, client):
        """Test health endpoint returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data
        assert "timestamp" in data

    def test_readiness_check(self, client):
        """Test readiness endpoint returns ready status."""
        response = client.get("/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["ready"] is True


class TestPredictEndpoints:
    """Test prediction endpoints."""

    def test_harvest_prediction(self, client):
        """Test harvest prediction endpoint."""
        payload = {
            "crop": "Onion",
            "district": "Nashik",
            "sowing_date": "2025-10-15",
            "crop_stage": "harvest-ready",
            "soil_type": "Loamy",
            "state": "Maharashtra",
        }
        response = client.post("/predict/harvest", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "harvest_window" in data
        assert "recommendation" in data
        assert "confidence" in data

    def test_mandi_prediction(self, client):
        """Test mandi prediction endpoint."""
        payload = {
            "crop": "Tomato",
            "district": "Pune",
            "quantity_quintals": 15.0,
            "state": "Maharashtra",
        }
        response = client.post("/predict/mandi", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "best_mandi" in data
        assert "expected_price_range" in data
        assert "confidence" in data

    def test_spoilage_prediction(self, client):
        """Test spoilage risk prediction endpoint."""
        payload = {
            "crop": "Onion",
            "storage_type": "warehouse",
            "transit_hours": 8.0,
            "days_since_harvest": 3,
            "district": "Nashik",
            "state": "Maharashtra",
        }
        response = client.post("/predict/spoilage", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "risk_score" in data
        assert "risk_category" in data
        assert "days_safe" in data

    def test_harvest_validation_error(self, client):
        """Test harvest prediction with invalid input."""
        payload = {
            "crop": "X",  # Too short
            "district": "Nashik",
            "sowing_date": "2025-10-15",
            "crop_stage": "harvest-ready",
            "soil_type": "Loamy",
        }
        response = client.post("/predict/harvest", json=payload)
        assert response.status_code == 422  # Validation error


class TestWeatherEndpoint:
    """Test weather API endpoint."""

    def test_weather_for_district(self, client):
        """Test weather endpoint for a known district."""
        response = client.get("/api/weather/Nashik", params={"state": "Maharashtra"})
        assert response.status_code == 200
        data = response.json()
        assert data["district"] == "Nashik"
        assert "avg_temp" in data
        assert "alerts" in data

    def test_weather_fallback_for_unknown_district(self, client):
        """Test weather endpoint uses fallback for unknown district."""
        response = client.get("/api/weather/UnknownPlace")
        assert response.status_code == 200
        data = response.json()
        # Should still return data (fallback)
        assert "avg_temp" in data


class TestMarketEndpoint:
    """Test market prices endpoint."""

    def test_market_prices(self, client):
        """Test market prices endpoint."""
        response = client.get(
            "/api/market/prices",
            params={"district": "Nashik", "state": "Maharashtra"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["district"] == "Nashik"
        assert "prices" in data
        assert "neighbor_intelligence" in data


class TestSchemesEndpoint:
    """Test government schemes endpoint."""

    def test_schemes_endpoint(self, client):
        """Test schemes endpoint returns scheme list."""
        response = client.get(
            "/api/schemes",
            params={"crop": "Wheat", "state": "Maharashtra"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "schemes" in data
        assert "source" in data
        # Should have fallback schemes at minimum
        assert len(data["schemes"]) > 0
