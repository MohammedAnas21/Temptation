import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.marketing import Coupon, CouponType, CouponRedemption


async def validate_coupon(
    db: AsyncSession,
    code: str,
    user_id: uuid.UUID,
    order_subtotal: float,
) -> dict:
    """Validate a coupon code. Returns discount amount or raises ValueError."""
    result = await db.execute(select(Coupon).where(Coupon.code == code.upper(), Coupon.is_active == True))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise ValueError("Invalid or inactive coupon code")

    now = datetime.now(timezone.utc)
    if coupon.valid_from and now < coupon.valid_from:
        raise ValueError("Coupon is not yet valid")
    if coupon.valid_until and now > coupon.valid_until:
        raise ValueError("Coupon has expired")
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        raise ValueError("Coupon usage limit reached")
    if order_subtotal < coupon.min_order_value:
        raise ValueError(f"Minimum order value ₹{coupon.min_order_value:.0f} required")

    # Check if user already used this coupon
    prev = await db.execute(
        select(CouponRedemption).where(CouponRedemption.coupon_id == coupon.id, CouponRedemption.user_id == user_id)
    )
    if prev.scalar_one_or_none():
        raise ValueError("You have already used this coupon")

    if coupon.type == CouponType.percentage:
        discount = order_subtotal * (coupon.value / 100)
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    else:
        discount = min(coupon.value, order_subtotal)

    return {"coupon_id": coupon.id, "code": coupon.code, "discount": round(discount, 2)}


async def apply_coupon(
    db: AsyncSession,
    coupon_id: uuid.UUID,
    user_id: uuid.UUID,
    order_id: uuid.UUID,
    discount_amount: float,
) -> None:
    """Record coupon redemption and increment usage count."""
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if coupon:
        coupon.used_count += 1

    redemption = CouponRedemption(
        coupon_id=coupon_id,
        user_id=user_id,
        order_id=order_id,
        discount_amount=discount_amount,
        created_at=datetime.now(timezone.utc),
    )
    db.add(redemption)
    await db.flush()
