"""Referral system router — tracking, tree, rewards, leaderboard."""
import uuid
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.database import get_db
from app.models.loyalty import Referral, LoyaltyAccount, LoyaltyTransactionType
from app.models.user import User, UserRole
from app.middleware.auth import get_current_user, require_manager
from app.services.loyalty import get_or_create_account, award_points

router = APIRouter(prefix="/referrals", tags=["referrals"])


def _generate_referral_code() -> str:
    """Generate a unique 8-character referral code."""
    return "TEMPT" + secrets.token_hex(2).upper()


@router.get("/my-code")
async def get_my_referral_code(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get or generate the current user's referral code."""
    if not user.referral_code:
        user.referral_code = _generate_referral_code()
        await db.commit()
    return {"referral_code": user.referral_code}


@router.post("/apply")
async def apply_referral_code(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Apply a referral code during registration or first order."""
    if user.referred_by:
        raise HTTPException(status_code=400, detail="Referral code already applied")

    # Find the referrer by code
    result = await db.execute(select(User).where(User.referral_code == code, User.is_active == True))
    referrer = result.scalar_one_or_none()
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    if referrer.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot refer yourself")

    # Create referral record
    referral = Referral(
        referrer_id=referrer.id,
        referred_id=user.id,
        status="completed",
        created_at=datetime.now(timezone.utc),
    )
    db.add(referral)
    user.referred_by = referrer.id

    # Award points to referrer
    from app.config import get_settings
    settings = get_settings()
    await award_points(db, referrer.id, settings.referral_bonus_points, LoyaltyTransactionType.referral, description=f"Referral bonus for inviting {user.name or 'a friend'}")

    await db.commit()
    return {
        "message": "Referral applied successfully",
        "referrer_name": referrer.name,
        "bonus_points": settings.referral_bonus_points,
    }


@router.get("/my-referrals")
async def my_referrals(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 30,
):
    """List users referred by the current user."""
    result = await db.execute(
        select(Referral).where(Referral.referrer_id == user.id)
        .order_by(Referral.created_at.desc())
        .offset(skip).limit(limit)
    )
    referrals = result.scalars().all()

    # Enrich with referred user names
    items = []
    for ref in referrals:
        referred_result = await db.execute(select(User.name, User.created_at).where(User.id == ref.referred_id))
        referred = referred_result.one_or_none()
        items.append({
            "id": str(ref.id),
            "referred_name": referred[0] if referred else "Unknown",
            "referred_joined": referred[1].isoformat() if referred and referred[1] else None,
            "status": ref.status,
            "created_at": ref.created_at.isoformat(),
        })

    # Total count
    count_result = await db.execute(
        select(func.count()).select_from(Referral).where(Referral.referrer_id == user.id)
    )
    total = count_result.scalar() or 0

    return {"referrals": items, "total": total}


@router.get("/leaderboard")
async def referral_leaderboard(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(10, ge=1, le=50),
):
    """Top referrers (public endpoint)."""
    result = await db.execute(
        select(
            Referral.referrer_id,
            func.count(Referral.id).label("count"),
        )
        .where(Referral.status == "completed")
        .group_by(Referral.referrer_id)
        .order_by(func.count(Referral.id).desc())
        .limit(limit)
    )
    rows = result.all()

    leaderboard = []
    for row in rows:
        user_result = await db.execute(select(User.name).where(User.id == row.referrer_id))
        name = user_result.scalar()
        leaderboard.append({
            "user_id": str(row.referrer_id),
            "name": name or "Anonymous",
            "referral_count": row.count,
        })

    return leaderboard


@router.get("/stats", dependencies=[Depends(require_manager)])
async def referral_stats(db: AsyncSession = Depends(get_db)):
    """Referral statistics (manager+)."""
    total_result = await db.execute(select(func.count()).select_from(Referral))
    total = total_result.scalar() or 0

    completed_result = await db.execute(
        select(func.count()).select_from(Referral).where(Referral.status == "completed")
    )
    completed = completed_result.scalar() or 0

    # Unique referrers
    unique_result = await db.execute(
        select(func.count(func.distinct(Referral.referrer_id)))
    )
    unique_referrers = unique_result.scalar() or 0

    return {
        "total_referrals": total,
        "completed_referrals": completed,
        "pending_referrals": total - completed,
        "unique_referrers": unique_referrers,
    }
