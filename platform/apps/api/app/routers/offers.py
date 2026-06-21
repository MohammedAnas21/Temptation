import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.database import get_db
from app.models.marketing import Offer, Coupon, CouponType
from app.models.user import User
from app.middleware.auth import get_current_user, require_admin
from app.services.coupon import validate_coupon

router = APIRouter(prefix="/offers", tags=["offers"])


class OfferCreate(BaseModel):
    title: str
    description: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None


class CouponCreate(BaseModel):
    code: str
    type: CouponType
    value: float
    min_order_value: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None


@router.get("")
async def list_offers(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Offer).where(
            and_(
                Offer.is_active == True,
                (Offer.valid_from == None) | (Offer.valid_from <= now),
                (Offer.valid_until == None) | (Offer.valid_until >= now),
            )
        ).order_by(Offer.created_at.desc())
    )
    offers = result.scalars().all()
    return [{"id": str(o.id), "title": o.title, "description": o.description, "image_url": o.image_url, "valid_until": o.valid_until.isoformat() if o.valid_until else None} for o in offers]


@router.post("", dependencies=[Depends(require_admin)])
async def create_offer(payload: OfferCreate, db: AsyncSession = Depends(get_db)):
    offer = Offer(**payload.model_dump())
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return {"id": str(offer.id), "title": offer.title}


@router.post("/coupons/validate")
async def validate(
    code: str,
    order_subtotal: float,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await validate_coupon(db, code, user.id, order_subtotal)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/coupons", dependencies=[Depends(require_admin)])
async def list_coupons(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Coupon).order_by(Coupon.created_at.desc()))
    coupons = result.scalars().all()
    return [{"id": str(c.id), "code": c.code, "type": c.type.value, "value": float(c.value), "used_count": c.used_count, "is_active": c.is_active} for c in coupons]


@router.post("/coupons", dependencies=[Depends(require_admin)])
async def create_coupon(payload: CouponCreate, db: AsyncSession = Depends(get_db)):
    coupon = Coupon(**payload.model_dump())
    coupon.code = payload.code.upper()
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return {"id": str(coupon.id), "code": coupon.code}
