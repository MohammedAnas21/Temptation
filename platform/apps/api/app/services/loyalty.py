import uuid
import math
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction, LoyaltyTransactionType, LoyaltyTierName
from app.config import get_settings

settings = get_settings()

TIER_THRESHOLDS = {
    LoyaltyTierName.bronze: (0, 999),
    LoyaltyTierName.silver: (1000, 4999),
    LoyaltyTierName.gold: (5000, None),
}

TIER_MULTIPLIERS = {
    LoyaltyTierName.bronze: 1.0,
    LoyaltyTierName.silver: 1.25,
    LoyaltyTierName.gold: 1.5,
}


def _compute_tier(lifetime_points: int) -> LoyaltyTierName:
    if lifetime_points >= 5000:
        return LoyaltyTierName.gold
    elif lifetime_points >= 1000:
        return LoyaltyTierName.silver
    return LoyaltyTierName.bronze


async def get_or_create_account(db: AsyncSession, user_id: uuid.UUID) -> LoyaltyAccount:
    result = await db.execute(select(LoyaltyAccount).where(LoyaltyAccount.user_id == user_id))
    account = result.scalar_one_or_none()
    if not account:
        account = LoyaltyAccount(user_id=user_id, points_balance=0, lifetime_points=0)
        db.add(account)
        await db.flush()
    return account


_EARN_TYPES = {
    LoyaltyTransactionType.earn,
    LoyaltyTransactionType.reservation_checkin,
    LoyaltyTransactionType.birthday,
    LoyaltyTransactionType.anniversary,
    LoyaltyTransactionType.referral,
}


async def award_points(
    db: AsyncSession,
    user_id: uuid.UUID,
    points: int,
    txn_type: LoyaltyTransactionType,
    reference_id: Optional[uuid.UUID] = None,
    description: Optional[str] = None,
) -> LoyaltyAccount:
    account = await get_or_create_account(db, user_id)
    multiplier = TIER_MULTIPLIERS.get(account.tier, 1.0)
    actual_points = math.floor(points * multiplier) if txn_type == LoyaltyTransactionType.earn else points

    account.points_balance += actual_points
    if txn_type in _EARN_TYPES:
        account.lifetime_points += actual_points
        account.tier = _compute_tier(account.lifetime_points)

    txn = LoyaltyTransaction(
        user_id=user_id,
        type=txn_type,
        points=actual_points,
        reference_id=reference_id,
        description=description or f"{txn_type.value}: +{actual_points} pts",
        created_at=datetime.now(timezone.utc),
    )
    db.add(txn)
    await db.flush()
    return account


async def earn_from_order(db: AsyncSession, user_id: uuid.UUID, order_total: float, order_id: uuid.UUID) -> int:
    base_points = math.floor(order_total * settings.points_per_rupee)
    if base_points <= 0:
        return 0
    account = await award_points(db, user_id, base_points, LoyaltyTransactionType.earn, order_id, f"Order #{order_id}")
    multiplier = TIER_MULTIPLIERS.get(account.tier, 1.0)
    return math.floor(base_points * multiplier)


async def refund_points(
    db: AsyncSession,
    user_id: uuid.UUID,
    points: int,
    order_id: uuid.UUID,
    description: Optional[str] = None,
) -> None:
    """Restore redeemed points on order cancellation without inflating lifetime_points."""
    if points <= 0:
        return
    account = await get_or_create_account(db, user_id)
    account.points_balance += points
    txn = LoyaltyTransaction(
        user_id=user_id,
        type=LoyaltyTransactionType.manual,
        points=points,
        reference_id=order_id,
        description=description or f"Refund {points} pts for cancelled order",
        created_at=datetime.now(timezone.utc),
    )
    db.add(txn)
    await db.flush()


async def redeem_points(db: AsyncSession, user_id: uuid.UUID, points: int, order_id: uuid.UUID) -> float:
    """Redeem points and return the discount amount in rupees."""
    account = await get_or_create_account(db, user_id)
    if points < settings.min_redemption_points:
        raise ValueError(f"Minimum redemption is {settings.min_redemption_points} points")
    if account.points_balance < points:
        raise ValueError("Insufficient points balance")

    discount = points * settings.points_redemption_rate
    account.points_balance -= points

    txn = LoyaltyTransaction(
        user_id=user_id,
        type=LoyaltyTransactionType.redeem,
        points=-points,
        reference_id=order_id,
        description=f"Redeemed {points} pts for ₹{discount:.0f} off",
        created_at=datetime.now(timezone.utc),
    )
    db.add(txn)
    await db.flush()
    return discount
