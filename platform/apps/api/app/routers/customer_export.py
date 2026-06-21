"""Customer CSV export router — segment-based exports for CRM."""
import uuid
import csv
import io
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Path, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.database import get_db
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.loyalty import LoyaltyAccount
from app.middleware.auth import require_manager

router = APIRouter(prefix="/exports", tags=["exports"], dependencies=[Depends(require_manager)])


@router.get("/customers/{segment}")
async def export_customers_csv(
    segment: str = Path(..., description="vip|inactive|frequent|birthday|all"),
    db: AsyncSession = Depends(get_db),
):
    """Export customers in a segment as CSV."""
    today = date.today()
    thirty_ago = today - timedelta(days=30)
    sixty_ago = today - timedelta(days=60)

    query = select(User).where(User.role == UserRole.customer, User.is_active == True, User.deleted_at == None)

    if segment == "vip":
        query = query.join(LoyaltyAccount, LoyaltyAccount.user_id == User.id).where(LoyaltyAccount.tier == "gold")
    elif segment == "inactive":
        # Customers with no orders in 60+ days
        active_ids_q = (
            select(Order.customer_id)
            .where(Order.created_at >= sixty_ago)
            .group_by(Order.customer_id)
        )
        query = query.where(User.id.notin_(active_ids_q))
    elif segment == "frequent":
        # Customers with 4+ orders in last 30 days
        frequent_ids_q = (
            select(Order.customer_id)
            .where(Order.created_at >= thirty_ago)
            .group_by(Order.customer_id)
            .having(func.count(Order.id) >= 4)
        )
        query = query.where(User.id.in_(frequent_ids_q))
    elif segment == "birthday":
        query = query.where(func.extract("month", User.birthday) == today.month)
    elif segment != "all":
        # Unknown segment — return all
        pass

    query = query.order_by(User.created_at.desc())
    result = await db.execute(query)
    users = result.scalars().all()

    # Build CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "name", "phone", "email", "birthday", "anniversary", "referral_code", "created_at"])
    for u in users:
        writer.writerow([
            str(u.id),
            u.name or "",
            u.phone or "",
            u.email or "",
            str(u.birthday) if u.birthday else "",
            str(u.anniversary) if u.anniversary else "",
            u.referral_code or "",
            u.created_at.isoformat() if u.created_at else "",
        ])

    output.seek(0)
    filename = f"customers_{segment}_{today.isoformat()}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/orders")
async def export_orders_csv(
    skip: int = 0,
    limit: int = Query(1000, ge=1, le=10000),
    db: AsyncSession = Depends(get_db),
):
    """Export recent orders as CSV."""
    result = await db.execute(
        select(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit)
    )
    orders = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "customer_id", "branch_id", "status", "total_amount", "payment_status", "created_at"])
    for o in orders:
        writer.writerow([
            str(o.id),
            str(o.customer_id),
            str(o.branch_id),
            o.status.value,
            float(o.total_amount),
            o.payment_status.value if o.payment_status else "",
            o.created_at.isoformat() if o.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="orders_{date.today().isoformat()}.csv"'},
    )
