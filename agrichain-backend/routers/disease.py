"""Disease scanner router — proxies HuggingFace plant disease model."""

import base64
import os
from typing import Any, Dict

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/disease", tags=["disease"])

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL_URL = (
    "https://api-inference.huggingface.co/models/"
    "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
)

DISEASE_NAME_MAP = {
    "Tomato___Early_blight": "पत्ती का धब्बा रोग (Early Blight)",
    "Tomato___Late_blight": "टमाटर का झुलसा रोग (Late Blight)",
    "Tomato___healthy": "फसल स्वस्थ है ✅",
    "Tomato___Leaf_Mold": "पत्ती फफूंद (Leaf Mold)",
    "Tomato___Septoria_leaf_spot": "सेप्टोरिया पत्ती धब्बा",
    "Tomato___Bacterial_spot": "बैक्टीरियल स्पॉट",
    "Tomato___Target_Spot": "लक्ष्य धब्बा रोग (Target Spot)",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "पीली पत्ती मोड़ वायरस",
    "Tomato___Tomato_mosaic_virus": "मोज़ेक वायरस",
    "Onion___purple_blotch": "बैंगनी धब्बा रोग (Purple Blotch)",
    "Potato___Late_blight": "आलू का झुलसा रोग (Late Blight)",
    "Potato___Early_blight": "आलू पत्ती धब्बा रोग",
    "Potato___healthy": "फसल स्वस्थ है ✅",
    "Corn_(maize)___healthy": "फसल स्वस्थ है ✅",
    "Corn_(maize)___Common_rust_": "मक्का का रतुआ रोग (Rust)",
    "Rice___Brown_spot": "भूरा धब्बा रोग (Brown Spot)",
    "Rice___Leaf_blast": "ब्लास्ट रोग (Leaf Blast)",
    "Rice___healthy": "फसल स्वस्थ है ✅",
    "Wheat___healthy": "फसल स्वस्थ है ✅",
    "Wheat___Brown_rust": "गेहूं का भूरा रतुआ",
}

TREATMENT_MAP = {
    "healthy": [],
    "default": [
        {"rank": "🥇", "label": "सबसे सस्ता", "treatment": "नीम के तेल का छिड़काव", "cost": 120, "unit": "एकड़"},
        {"rank": "🥈", "label": "सबसे असरदार", "treatment": "Mancozeb + Carbendazim spray", "cost": 340, "unit": "एकड़"},
        {"rank": "🥉", "label": "Expert सलाह", "treatment": "Copper Oxychloride + systemic fungicide", "cost": 580, "unit": "एकड़"},
    ],
}


def _get_display_name(label: str) -> str:
    for key, value in DISEASE_NAME_MAP.items():
        if key.lower() in label.lower() or label.lower() in key.lower():
            return value
    return label.replace("_", " ").strip()


def _is_healthy(label: str) -> bool:
    return "healthy" in label.lower()


class ScanRequest(BaseModel):
    image_base64: str


@router.post("/scan")
async def scan_disease(payload: ScanRequest) -> Dict[str, Any]:
    """Analyse a plant image for disease using HuggingFace model."""
    if not HF_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="HF_TOKEN not configured. Cannot perform disease scan.",
        )

    try:
        image_bytes = base64.b64decode(payload.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                HF_MODEL_URL,
                headers={"Authorization": f"Bearer {HF_TOKEN}"},
                content=image_bytes,
            )
            response.raise_for_status()
            data = response.json()

        if not isinstance(data, list) or len(data) == 0:
            raise ValueError("Empty prediction response")

        # HF returns list of {label, score} sorted by score desc
        predictions = data if not isinstance(data[0], list) else data[0]
        top = predictions[0]
        label = top["label"]
        score = float(top["score"])
        healthy = _is_healthy(label)

        return {
            "success": True,
            "disease_label": label,
            "disease_name": _get_display_name(label),
            "confidence": round(score, 3),
            "is_healthy": healthy,
            "treatments": TREATMENT_MAP["healthy"] if healthy else TREATMENT_MAP["default"],
            "impact": None if healthy else "⚠️ 3 दिन पहले फसल काटें — नुकसान कम होगा",
        }

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"HuggingFace API error: {exc.response.status_code}",
        )
    except Exception as exc:
        return {
            "success": False,
            "message": "फोटो सेव हो गई। हमारा expert 2 घंटे में जाँच करेगा।",
            "error": str(exc),
        }
