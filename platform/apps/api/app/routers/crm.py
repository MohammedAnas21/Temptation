import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, text
from app.database import get_db
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.reservation import Reservation
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction
from app.middleware.auth import require_manager

router = APIRouter(prefix="/crm", tags=["crm"], dependencies=[Depends(require_manager)])


@router.get("/customers")
async def list_customers(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(User).where(User.role == "customer", User.deleted_at == None)
    if search:
        from sqlalchemy import or_
        q = q.where(or_(User.name.ilike(f"%{search}%"), User.phone.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
    q = q.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    users = result.scalars().all()
    return [_user_summary(u) for u in users]


@router.get("/customers/{customer_id}")
async def get_customer_detail(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == customer_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Orders
    orders_result = await db.execute(
        select(Order).where(Order.customer_id == customer_id).order_by(Order.created_at.desc()).limit(20)
    )
    orders = orders_result.scalars().all()

    # Reservations
    res_result = await db.execute(
        select(Reservation).where(Reservation.customer_id == customer_id).order_by(Reservation.reservation_date.desc()).limit(20)
    )
    reservations = res_result.scalars().all()

    # Loyalty
    loyalty_result = await db.execute(select(LoyaltyAccount).where(LoyaltyAccount.user_id == customer_id))
    loyalty = loyalty_result.scalar_one_or_none()

    # Total spend
    spend_result = await db.execute(
        select(func.sum(Order.total_amount)).where(Order.customer_id == customer_id, Order.status == OrderStatus.delivered)
    )
    total_spend = float(spend_result.scalar() or 0)

    return {
        "profile": _user_summary(user),
        "total_spend": total_spend,
        "loyalty": {
            "balance": loyalty.points_balance if loyalty else 0,
            "lifetime": loyalty.lifetime_points if loyalty else 0,
            "tier": loyalty.tier.value if loyalty else "bronze",
        },
        "recent_orders": [{"id": str(o.id), "total": float(o.total_amount), "status": o.status.value, "date": o.created_at.isoformat()} for o in orders],
        "recent_reservations": [{"id": str(r.id), "date": str(r.reservation_date), "status": r.status.value} for r in reservations],
    }


@router.get("/customers/{customer_id}/timeline")
async def get_customer_timeline(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db), limit: int = Query(50, ge=1, le=200)):
    """Customer activity timeline from the database view."""
    result = await db.execute(
        text("SELECT user_id, event_type, reference_id, created_at, detail FROM customer_timeline WHERE user_id = :uid ORDER BY created_at DESC LIMIT :lim"),
        {"uid": str(customer_id), "lim": limit},
    )
    rows = result.all()
    return [
        {
            "event_type": row.event_type,
            "reference_id": str(row.reference_id) if row.reference_id else None,
            "detail": row.detail,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]


@router.get("/customers/{customer_id}/clv")
async def get_customer_lifetime_value(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Customer lifetime value metrics."""
    # Total revenue
    rev_result = await db.execute(
        select(func.sum(Order.total_amount), func.count(Order.id), func.avg(Order.total_amount))
        .where(Order.customer_id == customer_id, Order.status == OrderStatus.delivered)
    )
    row = rev_result.one()
    total_revenue = float(row[0] or 0)
    order_count = row[1] or 0
    avg_order_value = float(row[2] or 0)

    # Visit count (orders + reservations)
    res_count_result = await db.execute(
        select(func.count()).select_from(Reservation).where(Reservation.customer_id == customer_id)
    )
    reservation_count = res_count_result.scalar() or 0

    # First and last order
    first_result = await db.execute(
        select(func.min(Order.created_at)).where(Order.customer_id == customer_id)
    )
    last_result = await db.execute(
        select(func.max(Order.created_at)).where(Order.customer_id == customer_id)
    )
    first_order = first_result.scalar()
    last_order = last_result.scalar()

    return {
        "customer_id": str(customer_id),
        "total_revenue": total_revenue,
        "order_count": order_count,
        "reservation_count": reservation_count,
        "avg_order_value": round(avg_order_value, 2),
        "first_order_at": first_order.isoformat() if first_order else None,
        "last_order_at": last_order.isoformat() if last_order else None,
        "total_visits": order_count + reservation_count,
    }


@router.get("/customers/{customer_id}/favorites")
async def get_customer_favorites(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Favorite items for a customer."""
    result = await db.execute(
        text("SELECT uf.menu_item_id, mi.name, uf.created_at FROM user_favorites uf JOIN menu_items mi ON mi.id = uf.menu_item_id WHERE uf.user_id = :uid ORDER BY uf.created_at DESC"),
        {"uid": str(customer_id)},
    )
    rows = result.all()
    return [
        {
            "menu_item_id": str(row.menu_item_id),
            "name": row.name,
            "favorited_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]


@router.get("/segments")
async def get_segments(db: AsyncSession = Depends(get_db)):
    """Returns pre-computed segment counts."""
    from datetime import date, timedelta
    today = date.today()
    thirty_ago = today - timedelta(days=30)
    sixty_ago = today - timedelta(days=60)

    async def count(q):
        r = await db.execute(select(func.count()).select_from(q.subquery()))
        return r.scalar() or 0

    vip = await count(
        select(User.id).join(LoyaltyAccount, LoyaltyAccount.user_id == User.id).where(LoyaltyAccount.tier == "gold")
    )
    inactive = await count(
        select(User.id)
        .outerjoin(Order, Order.customer_id == User.id)
        .where(User.role == UserRole.customer)
        .group_by(User.id)
        .having(
            (func.max(Order.created_at) < sixty_ago) |
            (func.max(Order.created_at) == None)
        )
    )
    frequent = await count(
        select(User.id).join(Order, Order.customer_id == User.id).where(
            Order.created_at >= thirty_ago
        ).group_by(User.id).having(func.count(Order.id) >= 4)
    )
    new_customers = await count(
        select(User.id).where(User.role == "customer", User.created_at >= thirty_ago)
    )
    birthday_month = await count(
        select(User.id).where(User.role == "customer", func.extract("month", User.birthday) == today.month)
    )

    return {
        "vip": vip,
        "inactive": inactive,
        "frequent": frequent,
        "new_customers": new_customers,
        "birthday_this_month": birthday_month,
    }


def _user_summary(u: User) -> dict:
    return {
        "id": str(u.id),
        "name": u.name,
        "phone": u.phone,
        "email": u.email,
        "birthday": str(u.birthday) if u.birthday else None,
        "anniversary": str(u.anniversary) if u.anniversary else None,
        "avatar_url": u.avatar_url,
        "referral_code": u.referral_code,
        "created_at": u.created_at.isoformat(),
    }
