import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction
from app.models.user import User
from app.middleware.auth import get_current_user
from app.services.loyalty import get_or_create_account, redeem_points

router = APIRouter(prefix="/loyalty", tags=["loyalty"])


class RedeemRequest(BaseModel):
    points: int
    order_id: uuid.UUID


@router.get("/me")
async def get_my_loyalty(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    account = await get_or_create_account(db, user.id)
    await db.commit()
    return {
        "user_id": str(user.id),
        "points_balance": account.points_balance,
        "lifetime_points": account.lifetime_points,
        "tier": account.tier.value,
        "tier_info": _tier_info(account.lifetime_points),
    }


@router.post("/redeem")
async def redeem(
    payload: RedeemRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.order import Order
    order_res = await db.execute(select(Order).where(Order.id == payload.order_id))
    order = order_res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if order.points_redeemed > 0:
        raise HTTPException(status_code=400, detail="Points already redeemed for this order")
    try:
        discount = await redeem_points(db, user.id, payload.points, payload.order_id)
        order.points_redeemed = payload.points
        await db.commit()
        return {"points_redeemed": payload.points, "discount_amount": discount}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transactions")
async def get_transactions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 30,
):
    result = await db.execute(
        select(LoyaltyTransaction)
        .where(LoyaltyTransaction.user_id == user.id)
        .order_by(LoyaltyTransaction.created_at.desc())
        .offset(skip).limit(limit)
    )
    txns = result.scalars().all()
    return [
        {
            "id": str(t.id),
            "type": t.type.value,
            "points": t.points,
            "description": t.description,
            "created_at": t.created_at.isoformat(),
        }
        for t in txns
    ]


def _tier_info(lifetime: int) -> dict:
    if lifetime >= 5000:
        return {"current": "gold", "next": None, "points_to_next": 0, "progress_pct": 100}
    elif lifetime >= 1000:
        return {"current": "silver", "next": "gold", "points_to_next": 5000 - lifetime, "progress_pct": round((lifetime - 1000) / 4000 * 100)}
    else:
        return {"current": "bronze", "next": "silver", "points_to_next": 1000 - lifetime, "progress_pct": round(lifetime / 1000 * 100)}
