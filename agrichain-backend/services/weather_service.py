import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

import requests
from cachetools import TTLCache
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_5DAY_URL = "https://api.openweathermap.org/data/2.5/forecast"
WEATHER_CACHE = TTLCache(maxsize=256, ttl=6 * 60 * 60)

DISTRICT_COORDINATES = {
    "nashik": {"lat": 20.011, "lon": 73.79},
    "pune": {"lat": 18.52, "lon": 73.8567},
    "aurangabad": {"lat": 19.8762, "lon": 75.3433},
    "nagpur": {"lat": 21.1458, "lon": 79.0882},
    "solapur": {"lat": 17.6599, "lon": 75.9064},
    "kolhapur": {"lat": 16.705, "lon": 74.2433},
    "amravati": {"lat": 20.9374, "lon": 77.7796},
}


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _round(value: float) -> float:
    return round(float(value), 3)


def _fallback_weather_features(district: str, reason: str) -> Dict[str, Any]:
    profile_shift = {
        "nashik": -1.0,
        "pune": -0.5,
        "aurangabad": 1.2,
        "nagpur": 1.8,
        "solapur": 1.5,
        "kolhapur": -1.6,
        "amravati": 1.1,
    }
    shift = profile_shift.get(district.lower(), 0.0)
    avg_temp = 33.0 + shift
    humidity = 67.0 - shift * 1.5

    return {
        "temp_min": _round(avg_temp - 4.0),
        "temp_max": _round(avg_temp + 4.5),
        "humidity": _round(humidity),
        "rainfall": _round(4.0 + max(0.0, shift * 1.2)),
        "weather_alerts": [],
        "rain_in_3days": False,
        "rain_in_7days": True if shift > 1.2 else False,
        "avg_temp_next7days": _round(avg_temp),
        "humidity_index": _round(humidity),
        "extreme_weather_flag": True if avg_temp > 36 else False,
        "source": "fallback",
        "fallback_reason": reason,
        "confidence": 0.58,
    }


def _parse_weather_features(payload: Dict[str, Any]) -> Dict[str, Any]:
    rows = payload.get("list", [])
    if not rows:
        raise ValueError("OpenWeatherMap forecast response is empty.")

    now = datetime.now(timezone.utc)
    cutoff_3d = now + timedelta(days=3)
    cutoff_7d = now + timedelta(days=7)

    temp_min = 10_000.0
    temp_max = -10_000.0
    humidities: List[float] = []
    temps: List[float] = []
    rainfall_total = 0.0
    rainfall_3d = 0.0
    rainfall_7d = 0.0
    weather_alerts = set()

    severe_terms = {
        "thunderstorm",
        "squall",
        "tornado",
        "heavy rain",
        "extreme",
    }

    for row in rows:
        dt_utc = datetime.fromtimestamp(int(row.get("dt", 0)), tz=timezone.utc)
        main = row.get("main", {})
        weather_list = row.get("weather", []) or []
        rain_data = row.get("rain", {})

        t_min = _safe_float(main.get("temp_min"), 0.0)
        t_max = _safe_float(main.get("temp_max"), 0.0)
        humidity = _safe_float(main.get("humidity"), 0.0)
        rainfall = _safe_float(rain_data.get("3h", 0.0), 0.0)

        temp_min = min(temp_min, t_min)
        temp_max = max(temp_max, t_max)
        humidities.append(humidity)
        temps.append((t_min + t_max) / 2.0)
        rainfall_total += rainfall

        if dt_utc <= cutoff_3d:
            rainfall_3d += rainfall
        if dt_utc <= cutoff_7d:
            rainfall_7d += rainfall

        for entry in weather_list:
            tag = str(entry.get("main", "")).strip().lower()
            description = str(entry.get("description", "")).strip().lower()
            for term in severe_terms:
                if term in tag or term in description:
                    weather_alerts.add(term)

    if temp_min == 10_000.0:
        temp_min = 0.0
    if temp_max == -10_000.0:
        temp_max = 0.0

    humidity_index = sum(humidities) / max(1, len(humidities))
    avg_temp_7d = sum(temps) / max(1, len(temps))
    rain_in_3days = rainfall_3d >= 8.0
    rain_in_7days = rainfall_7d >= 14.0
    extreme_weather_flag = bool(
        avg_temp_7d >= 36.5
        or temp_max >= 40.0
        or humidity_index >= 86.0
        or weather_alerts
    )

    return {
        "temp_min": _round(temp_min),
        "temp_max": _round(temp_max),
        "humidity": _round(humidity_index),
        "rainfall": _round(rainfall_total),
        "weather_alerts": sorted(weather_alerts),
        "rain_in_3days": rain_in_3days,
        "rain_in_7days": rain_in_7days,
        "avg_temp_next7days": _round(avg_temp_7d),
        "humidity_index": _round(humidity_index),
        "extreme_weather_flag": extreme_weather_flag,
        "source": "openweathermap",
        "confidence": 0.84,
    }


def fetch_weather_features(district: str, state: str = "Maharashtra") -> Dict[str, Any]:
    cache_key = f"{state.lower()}::{district.lower()}"
    if cache_key in WEATHER_CACHE:
        return WEATHER_CACHE[cache_key]

    coordinates = DISTRICT_COORDINATES.get(district.lower())
    if not coordinates:
        features = _fallback_weather_features(
            district=district,
            reason="Unknown district coordinates. Using climatology fallback.",
        )
        WEATHER_CACHE[cache_key] = features
        return features

    api_key = os.getenv("OPENWEATHER_API_KEY") or os.getenv("EXPO_PUBLIC_OPENWEATHER_API_KEY")
    if not api_key:
        features = _fallback_weather_features(
            district=district,
            reason="OPENWEATHER_API_KEY not set.",
        )
        WEATHER_CACHE[cache_key] = features
        return features

    try:
        response = requests.get(
            OPENWEATHER_5DAY_URL,
            params={
                "lat": coordinates["lat"],
                "lon": coordinates["lon"],
                "appid": api_key,
                "units": "metric",
            },
            timeout=4.0,
        )
        response.raise_for_status()
        parsed = _parse_weather_features(response.json())
        WEATHER_CACHE[cache_key] = parsed
        return parsed
    except Exception as exc:
        fallback = _fallback_weather_features(district=district, reason=str(exc))
        WEATHER_CACHE[cache_key] = fallback
        return fallback
