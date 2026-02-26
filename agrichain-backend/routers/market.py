"""Market router — live mandi prices for frontend MarketScreen."""

import random
from datetime import date, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query

from services.mandi_service import fetch_mandi_features

router = APIRouter(prefix="/api/market", tags=["market"])

CROP_EMOJIS = {
    "onion": "🧅", "tomato": "🍅", "wheat": "🌾",
    "rice": "🍚", "potato": "🥔", "soybean": "🫘",
}

DISTRICTS = ["Nashik", "Pune", "Nagpur", "Aurangabad", "Solapur", "Kolhapur"]
CROPS = ["Onion", "Tomato", "Wheat", "Rice", "Potato"]

# Simulated neighbor farmer counts per district-crop
NEIGHBOR_BASE = {
    "nashik": {"onion": 432, "tomato": 215, "wheat": 180, "rice": 120, "potato": 310},
    "pune": {"onion": 350, "tomato": 280, "wheat": 150, "rice": 90, "potato": 195},
    "nagpur": {"onion": 180, "tomato": 320, "wheat": 410, "rice": 270, "potato": 145},
    "aurangabad": {"onion": 290, "tomato": 195, "wheat": 220, "rice": 160, "potato": 250},
    "solapur": {"onion": 520, "tomato": 150, "wheat": 180, "rice": 140, "potato": 175},
    "kolhapur": {"onion": 160, "tomato": 420, "wheat": 130, "rice": 100, "potato": 290},
}


def _generate_history(base_price: float, days: int = 30) -> List[Dict[str, Any]]:
    """Generate synthetic 30-day price history from a base price."""
    history = []
    today = date.today()
    price = base_price
    rng = random.Random(int(base_price * 100))
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        change = (rng.random() - 0.48) * 2.5
        price = max(base_price * 0.7, min(base_price * 1.4, price + change))
        history.append({
            "date": d.isoformat(),
            "date_label": f"{d.day}/{d.month}",
            "price": round(price, 1),
        })
    return history


def _neighbor_intelligence(district: str, crop: str) -> Dict[str, Any]:
    """Get neighbor farmer intelligence for a district-crop pair."""
    district_key = district.strip().lower()
    crop_key = crop.strip().lower()
    farmer_count = NEIGHBOR_BASE.get(district_key, {}).get(crop_key, 250)

    if farmer_count > 400:
        level = "high"
        color = "#C62828"
        message = "⚠️ ज्यादा supply से भाव 15-20% गिर सकते हैं।"
        alt = next((d for d in DISTRICTS if d.lower() != district_key and
                     NEIGHBOR_BASE.get(d.lower(), {}).get(crop_key, 300) < 200), None)
        suggestion = f"{alt} मंडी try करें।" if alt else "कुछ दिन रुकें।"
    elif farmer_count < 200:
        level = "low"
        color = "#2E7D32"
        message = "✅ कम competition — अच्छे भाव मिल सकते हैं"
        suggestion = "आज बेचने का अच्छा मौका है!"
    else:
        level = "medium"
        color = "#E0A800"
        message = "🟡 सामान्य supply — भाव स्थिर रहने की संभावना"
        suggestion = "बाज़ार की स्थिति सामान्य है।"

    return {
        "farmer_count": farmer_count,
        "level": level,
        "color": color,
        "message": message,
        "suggestion": suggestion,
    }


@router.get("/prices")
def get_market_prices(
    district: str = Query("Nashik", min_length=2),
    crop: Optional[str] = Query(None),
    state: str = Query("Maharashtra"),
) -> Dict[str, Any]:
    """Return live mandi prices for all crops in a district, or a specific crop."""
    crops_to_fetch = [crop] if crop else CROPS
    results = []

    for c in crops_to_fetch:
        crop_key = c.strip().lower()
        features = fetch_mandi_features(crop=c, state=state, district=district)

        # Convert per-quintal price to per-kg for display
        best_price_per_kg = round(float(features.get("best_mandi_price", 0)) / 100, 1)
        local_price_per_kg = round(float(features.get("local_mandi_price", 0)) / 100, 1)

        # Calculate daily change from momentum
        momentum = features.get("price_momentum", "stable")
        if momentum == "rising":
            change = round(best_price_per_kg * 0.03, 1)
        elif momentum == "falling":
            change = round(-best_price_per_kg * 0.025, 1)
        else:
            change = round((random.random() - 0.5) * 0.8, 1)

        results.append({
            "crop": c.capitalize(),
            "emoji": CROP_EMOJIS.get(crop_key, "🌱"),
            "price": best_price_per_kg,
            "change": change,
            "mandi": features.get("best_mandi_name", f"{district} Mandi"),
            "history": _generate_history(best_price_per_kg),
            "source": features.get("source", "fallback"),
            "confidence": features.get("confidence", 0.56),
        })

    neighbor = _neighbor_intelligence(district, crop or "Onion")

    return {
        "district": district,
        "prices": results,
        "neighbor_intelligence": neighbor,
        "source": results[0]["source"] if results else "fallback",
    }
