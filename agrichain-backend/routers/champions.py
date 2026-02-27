"""
[F8] Village Champions Leaderboard Router
═══════════════════════════════════════════════════════════════════════════════

Monthly gamification leaderboard that ranks farmers by
yield accuracy, price achievement, and app contribution.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from core.logging import get_logger
from db.session import get_db
from db.models import (
    ChampionScore, HarvestCycle, CrowdOutcome, CropDiaryEntry, User,
)

logger = get_logger("agrimitra.routers.champions")
router = APIRouter(prefix="/champions", tags=["champions"])


# ── Badge definitions ────────────────────────────────────────────────────

BADGES = {
    90: "🏆 Krishi Champion",
    75: "⭐ Star Farmer",
    60: "🌾 Rising Farmer",
    40: "🌱 Active Farmer",
    0: "👋 New Farmer",
}


def _get_badge(score: float) -> str:
    for threshold, badge in sorted(BADGES.items(), reverse=True):
        if score >= threshold:
            return badge
    return "👋 New Farmer"


# ── Score computation ────────────────────────────────────────────────────

def compute_champion_score(
    user_id: int,
    month: str,
    db: Session,
) -> Dict[str, Any]:
    """Compute champion score for a user for a given month."""
    # 1. Yield accuracy: how close actual yield was to predicted
    # (approximated from HarvestCycle data)
    harvest_cycles = (
        db.query(HarvestCycle)
        .filter(HarvestCycle.user_id == user_id)
        .all()
    )
    if harvest_cycles:
        # Score based on minimizing loss
        total_rev = sum(c.total_revenue or 0 for c in harvest_cycles)
        total_loss = sum(c.loss_amount or 0 for c in harvest_cycles)
        loss_ratio = total_loss / total_rev if total_rev > 0 else 0.5
        yield_score = round(max(0, (1 - loss_ratio)) * 100, 1)
    else:
        yield_score = 50.0  # Default for new users

    # 2. Price achievement: actual vs optimal price
    if harvest_cycles:
        price_ratios = []
        for c in harvest_cycles:
            if c.optimal_price and c.sale_price_per_quintal:
                ratio = c.sale_price_per_quintal / c.optimal_price
                price_ratios.append(min(ratio, 1.0))
        price_score = round((sum(price_ratios) / len(price_ratios)) * 100, 1) if price_ratios else 50.0
    else:
        price_score = 50.0

    # 3. App contribution: diary entries + crowd outcomes shared
    diary_count = db.query(func.count(CropDiaryEntry.id)).filter(
        CropDiaryEntry.user_id == user_id
    ).scalar() or 0

    contribution_score = min(100, round(diary_count * 5 + len(harvest_cycles) * 10, 1))

    total = round((yield_score * 0.4 + price_score * 0.4 + contribution_score * 0.2), 1)
    badge = _get_badge(total)

    return {
        "user_id": user_id,
        "month": month,
        "yield_accuracy_score": yield_score,
        "price_achievement_score": price_score,
        "app_contribution_score": contribution_score,
        "total_score": total,
        "badge": badge,
    }


def update_all_scores(month: str, db: Session):
    """Batch update all champion scores for a month."""
    users = db.query(User).filter(User.is_active == True).all()
    scores = []
    for user in users:
        data = compute_champion_score(user.id, month, db)
        existing = (
            db.query(ChampionScore)
            .filter(ChampionScore.user_id == user.id, ChampionScore.month == month)
            .first()
        )
        if existing:
            for k, v in data.items():
                if k not in ("user_id", "month"):
                    setattr(existing, k, v)
        else:
            score = ChampionScore(
                user_id=user.id,
                district=user.district or "Unknown",
                **{k: v for k, v in data.items() if k != "user_id"},
            )
            db.add(score)
        scores.append(data)

    # Compute ranks
    db.flush()
    all_scores = (
        db.query(ChampionScore)
        .filter(ChampionScore.month == month)
        .order_by(desc(ChampionScore.total_score))
        .all()
    )
    for i, s in enumerate(all_scores, 1):
        s.rank = i

    db.commit()
    return scores


# ── Endpoints ────────────────────────────────────────────────────────────

@router.get("/leaderboard/{district}")
def get_leaderboard(
    district: str,
    month: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get the village champions leaderboard for a district."""
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")

    query = (
        db.query(ChampionScore)
        .filter(ChampionScore.month == month)
    )
    if district.lower() != "all":
        query = query.filter(ChampionScore.district.ilike(f"%{district}%"))

    leaders = query.order_by(desc(ChampionScore.total_score)).limit(limit).all()

    # Get user names
    user_ids = [l.user_id for l in leaders]
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.full_name for u in users}

    results = []
    for l in leaders:
        results.append({
            "rank": l.rank,
            "user_id": l.user_id,
            "farmer_name": user_map.get(l.user_id, "Unknown"),
            "district": l.district,
            "total_score": l.total_score,
            "badge": l.badge,
            "breakdown": {
                "yield_accuracy": l.yield_accuracy_score,
                "price_achievement": l.price_achievement_score,
                "app_contribution": l.app_contribution_score,
            },
        })

    return {
        "district": district,
        "month": month,
        "leaderboard": results,
        "total_participants": len(results),
    }


@router.get("/my-score/{user_id}")
def get_my_score(
    user_id: int,
    month: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get a farmer's champion score and rank."""
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")

    score = (
        db.query(ChampionScore)
        .filter(ChampionScore.user_id == user_id, ChampionScore.month == month)
        .first()
    )

    if not score:
        # Compute on the fly
        data = compute_champion_score(user_id, month, db)
        return {
            **data,
            "rank": None,
            "message": "Score computed on-the-fly. Leaderboard rank will update soon.",
        }

    total_in_district = db.query(func.count(ChampionScore.id)).filter(
        ChampionScore.district == score.district,
        ChampionScore.month == month,
    ).scalar()

    return {
        "user_id": user_id,
        "month": month,
        "rank": score.rank,
        "total_in_district": total_in_district,
        "total_score": score.total_score,
        "badge": score.badge,
        "breakdown": {
            "yield_accuracy": score.yield_accuracy_score,
            "price_achievement": score.price_achievement_score,
            "app_contribution": score.app_contribution_score,
        },
        "district": score.district,
    }


@router.post("/compute/{month}")
def trigger_score_computation(
    month: str,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Manually trigger score computation for a month (admin)."""
    scores = update_all_scores(month, db)
    return {
        "month": month,
        "computed_count": len(scores),
        "message": f"Scores computed for {len(scores)} farmers.",
    }
