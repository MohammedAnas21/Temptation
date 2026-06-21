"""
Analytics API — all reporting endpoints.
All endpoints require manager role or above.
"""
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case, text
from app.database import get_db
from app.models.order import Order, OrderStatus, OrderItem
from app.models.reservation import Reservation, ReservationStatus
from app.models.table import CafeTable
from app.models.user import User, UserRole
from app.models.menu import MenuItem
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction
from app.models.marketing import Campaign, CampaignRecipient
from app.middleware.auth import require_manager

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    dependencies=[Depends(require_manager)],
)

# ── Helpers ───────────────────────────────────────────────────────────────────

def _period_start(period: str) -> datetime:
    """Return UTC datetime for start of period."""
    now = datetime.now(timezone.utc)
    if period == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        return now - timedelta(days=7)
    elif period == "month":
        return now - timedelta(days=30)
    elif period == "year":
        return now - timedelta(days=365)
    return now - timedelta(days=7)


# ── Revenue ───────────────────────────────────────────────────────────────────

@router.get("/revenue")
async def revenue(
    branch_id: Optional[uuid.UUID] = None,
    period: str = Query("week", enum=["today", "week", "month", "year"]),
    db: AsyncSession = Depends(get_db),
):
    start = _period_start(period)
    prev_start = start - (datetime.now(timezone.utc) - start)  # Same span before

    filters = [Order.status == OrderStatus.delivered, Order.created_at >= start]
    prev_filters = [Order.status == OrderStatus.delivered,
                    Order.created_at >= prev_start,
                    Order.created_at < start]
    if branch_id:
        filters.append(Order.branch_id == branch_id)
        prev_filters.append(Order.branch_id == branch_id)

    result = await db.execute(
        select(
            func.date(Order.created_at).label("day"),
            func.count(Order.id).label("order_count"),
            func.sum(Order.total_amount).label("revenue"),
            func.avg(Order.total_amount).label("avg_order"),
        ).where(and_(*filters))
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    )
    rows = result.all()

    prev_result = await db.execute(
        select(func.sum(Order.total_amount)).where(and_(*prev_filters))
    )
    prev_revenue = float(prev_result.scalar() or 0)

    total_revenue = sum(float(r.revenue or 0) for r in rows)
    total_orders = sum(r.order_count for r in rows)
    avg_order = total_revenue / total_orders if total_orders else 0
    pct_change = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue else 0

    return {
        "period": period,
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "avg_order_value": round(avg_order, 2),
        "revenue_change_pct": round(pct_change, 1),
        "daily": [
            {
                "date": str(r.day),
                "revenue": float(r.revenue or 0),
                "orders": r.order_count,
                "avg_order": float(r.avg_order or 0),
            }
            for r in rows
        ],
    }


# ── Orders ────────────────────────────────────────────────────────────────────

@router.get("/orders")
async def order_analytics(
    branch_id: Optional[uuid.UUID] = None,
    period: str = Query("week", enum=["today", "week", "month", "year"]),
    db: AsyncSession = Depends(get_db),
):
    start = _period_start(period)
    filters = [Order.created_at >= start]
    if branch_id:
        filters.append(Order.branch_id == branch_id)

    result = await db.execute(
        select(
            Order.status,
            func.count(Order.id).label("count"),
            func.avg(Order.total_amount).label("avg_value"),
            func.sum(Order.total_amount).label("total_value"),
        ).where(and_(*filters)).group_by(Order.status)
    )
    rows = result.all()

    # Fulfillment time (confirmed → delivered)
    fulfill_result = await db.execute(text("""
        SELECT AVG(EXTRACT(EPOCH FROM (
            (SELECT created_at FROM order_status_history
             WHERE order_id = o.id AND status = 'delivered'
             ORDER BY created_at LIMIT 1)
            -
            (SELECT created_at FROM order_status_history
             WHERE order_id = o.id AND status = 'confirmed'
             ORDER BY created_at LIMIT 1)
        )) / 60) AS avg_minutes
        FROM orders o
        WHERE o.created_at >= :start AND o.status = 'delivered'
    """), {"start": start.isoformat()})
    avg_fulfillment = float(fulfill_result.scalar() or 0)

    return {
        "avg_fulfillment_minutes": round(avg_fulfillment, 1),
        "by_status": [
            {
                "status": r.status.value,
                "count": r.count,
                "avg_value": float(r.avg_value or 0),
                "total_value": float(r.total_value or 0),
            }
            for r in rows
        ],
    }


# ── Reservations ──────────────────────────────────────────────────────────────

@router.get("/reservations")
async def reservation_analytics(
    branch_id: Optional[uuid.UUID] = None,
    period: str = Query("week", enum=["today", "week", "month", "year"]),
    db: AsyncSession = Depends(get_db),
):
    start = _period_start(period)
    filters = [Reservation.created_at >= start]
    if branch_id:
        filters.append(Reservation.branch_id == branch_id)

    result = await db.execute(
        select(Reservation.status, func.count(Reservation.id).label("count"))
        .where(and_(*filters)).group_by(Reservation.status)
    )
    rows = result.all()
    total = sum(r.count for r in rows)
    no_show = next((r.count for r in rows if r.status == ReservationStatus.no_show), 0)
    confirmed = next((r.count for r in rows if r.status == ReservationStatus.confirmed), 0)
    cancelled = next((r.count for r in rows if r.status == ReservationStatus.cancelled), 0)

    # Popular time slots
    slots_result = await db.execute(
        select(
            Reservation.reservation_time,
            func.count(Reservation.id).label("count"),
        )
        .where(and_(*filters))
        .group_by(Reservation.reservation_time)
        .order_by(func.count(Reservation.id).desc())
        .limit(5)
    )
    popular_slots = [{"time": str(r.reservation_time)[:5], "count": r.count} for r in slots_result.all()]

    return {
        "total": total,
        "confirmed": confirmed,
        "no_show_count": no_show,
        "no_show_rate": round(no_show / total * 100, 1) if total else 0,
        "cancellation_rate": round(cancelled / total * 100, 1) if total else 0,
        "popular_time_slots": popular_slots,
        "by_status": [{"status": r.status.value, "count": r.count} for r in rows],
    }


# ── Occupancy ─────────────────────────────────────────────────────────────────

@router.get("/occupancy")
async def occupancy_analytics(
    branch_id: Optional[uuid.UUID] = None,
    target_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """Table occupancy rates — per table and overall."""
    d = target_date or date.today()

    tables_result = await db.execute(
        select(CafeTable).where(
            CafeTable.branch_id == branch_id if branch_id else True
        )
    )
    tables = tables_result.scalars().all()
    if not tables:
        return {"date": str(d), "overall_occupancy_pct": 0, "tables": []}

    # Count reservations per table for the day
    res_result = await db.execute(
        select(
            Reservation.table_id,
            func.count(Reservation.id).label("reservation_count"),
        )
        .where(
            and_(
                Reservation.reservation_date == d,
                Reservation.status.in_([
                    ReservationStatus.confirmed,
                    ReservationStatus.checked_in,
                    ReservationStatus.checked_out,
                ]),
            )
        )
        .group_by(Reservation.table_id)
    )
    res_by_table = {str(r.table_id): r.reservation_count for r in res_result.all()}

    # Operating slots per day (e.g., 8 slots: 11:00–22:00, hourly)
    operating_slots = 8
    table_stats = []
    for t in tables:
        booked = res_by_table.get(str(t.id), 0)
        occupancy = min(round(booked / operating_slots * 100, 1), 100)
        table_stats.append({
            "table_id": str(t.id),
            "table_number": t.table_number,
            "table_type": t.table_type.value,
            "capacity": t.capacity,
            "bookings": booked,
            "occupancy_pct": occupancy,
        })

    total_bookings = sum(t["bookings"] for t in table_stats)
    max_bookings = len(tables) * operating_slots
    overall = round(total_bookings / max_bookings * 100, 1) if max_bookings else 0

    return {
        "date": str(d),
        "overall_occupancy_pct": overall,
        "total_bookings": total_bookings,
        "tables": sorted(table_stats, key=lambda x: x["table_number"]),
    }


# ── Top customers ─────────────────────────────────────────────────────────────

@router.get("/top-customers")
async def top_customers(
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            User.id, User.name, User.phone,
            func.count(Order.id).label("order_count"),
            func.sum(Order.total_amount).label("total_spend"),
            func.avg(Order.total_amount).label("avg_spend"),
            func.max(Order.created_at).label("last_order"),
        )
        .join(Order, Order.customer_id == User.id)
        .where(Order.status == OrderStatus.delivered)
        .group_by(User.id, User.name, User.phone)
        .order_by(func.sum(Order.total_amount).desc())
        .limit(limit)
    )
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "phone": r.phone,
            "orders": r.order_count,
            "total_spend": float(r.total_spend or 0),
            "avg_spend": float(r.avg_spend or 0),
            "last_order": r.last_order.isoformat() if r.last_order else None,
        }
        for r in result.all()
    ]


# ── Popular items ─────────────────────────────────────────────────────────────

@router.get("/popular-items")
async def popular_items(
    limit: int = Query(10, ge=1, le=50),
    period: str = Query("month", enum=["week", "month", "year"]),
    db: AsyncSession = Depends(get_db),
):
    start = _period_start(period)
    result = await db.execute(
        select(
            MenuItem.id, MenuItem.name, MenuItem.category_id,
            func.sum(OrderItem.quantity).label("total_ordered"),
            func.sum(OrderItem.quantity * OrderItem.unit_price).label("revenue"),
            func.count(func.distinct(OrderItem.order_id)).label("order_appearances"),
        )
        .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.created_at >= start, Order.status == OrderStatus.delivered)
        .group_by(MenuItem.id, MenuItem.name, MenuItem.category_id)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
    )
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "total_ordered": int(r.total_ordered or 0),
            "revenue": float(r.revenue or 0),
            "order_appearances": int(r.order_appearances or 0),
        }
        for r in result.all()
    ]


# ── Popular tables ────────────────────────────────────────────────────────────

@router.get("/popular-tables")
async def popular_tables(
    branch_id: Optional[uuid.UUID] = None,
    period: str = Query("month", enum=["week", "month", "year"]),
    db: AsyncSession = Depends(get_db),
):
    start = _period_start(period)
    filters = [Reservation.created_at >= start]
    if branch_id:
        filters.append(Reservation.branch_id == branch_id)

    result = await db.execute(
        select(
            CafeTable.id, CafeTable.table_number, CafeTable.table_type, CafeTable.capacity,
            func.count(Reservation.id).label("total_reservations"),
            func.avg(Reservation.guest_count).label("avg_guests"),
        )
        .join(Reservation, Reservation.table_id == CafeTable.id)
        .where(and_(*filters))
        .group_by(CafeTable.id, CafeTable.table_number, CafeTable.table_type, CafeTable.capacity)
        .order_by(func.count(Reservation.id).desc())
    )
    return [
        {
            "table_id": str(r.id),
            "table_number": r.table_number,
            "table_type": r.table_type.value,
            "capacity": r.capacity,
            "total_reservations": r.total_reservations,
            "avg_guests": float(r.avg_guests or 0),
        }
        for r in result.all()
    ]


# ── Peak hours ────────────────────────────────────────────────────────────────

@router.get("/peak-hours")
async def peak_hours(
    branch_id: Optional[uuid.UUID] = None,
    period: str = Query("month", enum=["week", "month", "year"]),
    db: AsyncSession = Depends(get_db),
):
    start = _period_start(period)
    filters = [Order.status == OrderStatus.delivered, Order.created_at >= start]
    if branch_id:
        filters.append(Order.branch_id == branch_id)

    result = await db.execute(
        select(
            func.extract("dow", Order.created_at).label("day_of_week"),
            func.extract("hour", Order.created_at).label("hour"),
            func.count(Order.id).label("count"),
            func.sum(Order.total_amount).label("revenue"),
        )
        .where(and_(*filters))
        .group_by("day_of_week", "hour")
        .order_by("day_of_week", "hour")
    )
    days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return [
        {
            "day": int(r.day_of_week),
            "day_name": days[int(r.day_of_week)],
            "hour": int(r.hour),
            "count": r.count,
            "revenue": float(r.revenue or 0),
        }
        for r in result.all()
    ]


# ── Retention / cohort ────────────────────────────────────────────────────────

@router.get("/retention")
async def retention_analytics(db: AsyncSession = Depends(get_db)):
    """30-day and 90-day customer retention rates."""
    now = datetime.now(timezone.utc)
    thirty = now - timedelta(days=30)
    sixty = now - timedelta(days=60)
    ninety = now - timedelta(days=90)
    one_eighty = now - timedelta(days=180)

    # New customers in the last 30 days who also ordered in the last 30 days
    new_customers = await db.execute(
        select(func.count(func.distinct(User.id)))
        .where(User.role == UserRole.customer, User.created_at >= thirty)
    )
    new_count = new_customers.scalar() or 0

    retained_30 = await db.execute(
        select(func.count(func.distinct(Order.customer_id)))
        .join(User, User.id == Order.customer_id)
        .where(User.created_at >= sixty, User.created_at < thirty, Order.created_at >= thirty)
    )
    retained_30_count = retained_30.scalar() or 0

    cohort_30_size = await db.execute(
        select(func.count(func.distinct(User.id)))
        .where(User.role == UserRole.customer, User.created_at >= sixty, User.created_at < thirty)
    )
    cohort_30 = cohort_30_size.scalar() or 1

    retained_90 = await db.execute(
        select(func.count(func.distinct(Order.customer_id)))
        .join(User, User.id == Order.customer_id)
        .where(User.created_at >= one_eighty, User.created_at < ninety, Order.created_at >= ninety)
    )
    retained_90_count = retained_90.scalar() or 0

    cohort_90_size = await db.execute(
        select(func.count(func.distinct(User.id)))
        .where(User.role == UserRole.customer, User.created_at >= one_eighty, User.created_at < ninety)
    )
    cohort_90 = cohort_90_size.scalar() or 1

    return {
        "new_customers_30d": new_count,
        "retention_rate_30d": round(retained_30_count / cohort_30 * 100, 1),
        "retention_rate_90d": round(retained_90_count / cohort_90 * 100, 1),
        "retained_customers_30d": retained_30_count,
        "retained_customers_90d": retained_90_count,
    }


# ── Loyalty analytics ─────────────────────────────────────────────────────────

@router.get("/loyalty")
async def loyalty_analytics(db: AsyncSession = Depends(get_db)):
    """Loyalty program health metrics."""
    tier_result = await db.execute(
        select(
            func.coalesce(func.cast(text("tier"), text("text")), "bronze").label("tier"),
            func.count(LoyaltyAccount.id).label("count"),
            func.sum(LoyaltyAccount.points_balance).label("total_balance"),
            func.avg(LoyaltyAccount.lifetime_points).label("avg_lifetime"),
        ).group_by(text("tier"))
    )
    tiers = [
        {
            "tier": r.tier,
            "member_count": r.count,
            "total_points_outstanding": int(r.total_balance or 0),
            "avg_lifetime_points": float(r.avg_lifetime or 0),
        }
        for r in tier_result.all()
    ]

    # Points earned vs redeemed last 30 days
    thirty_ago = datetime.now(timezone.utc) - timedelta(days=30)
    txn_result = await db.execute(
        select(
            case(
                (LoyaltyTransaction.points > 0, "earned"),
                else_="redeemed"
            ).label("direction"),
            func.sum(func.abs(LoyaltyTransaction.points)).label("total"),
            func.count(LoyaltyTransaction.id).label("count"),
        )
        .where(LoyaltyTransaction.created_at >= thirty_ago)
        .group_by("direction")
    )
    txn_stats = {r.direction: {"total": int(r.total or 0), "count": r.count} for r in txn_result.all()}

    return {
        "tiers": tiers,
        "last_30d_earned": txn_stats.get("earned", {"total": 0, "count": 0}),
        "last_30d_redeemed": txn_stats.get("redeemed", {"total": 0, "count": 0}),
    }


# ── Campaign analytics ────────────────────────────────────────────────────────

@router.get("/campaigns")
async def campaign_analytics(db: AsyncSession = Depends(get_db)):
    """Per-campaign performance metrics."""
    result = await db.execute(
        select(
            Campaign.id, Campaign.name, Campaign.type, Campaign.status, Campaign.sent_at,
            func.count(CampaignRecipient.id).label("total_recipients"),
            func.sum(case((CampaignRecipient.status == "sent", 1), else_=0)).label("sent"),
            func.sum(case((CampaignRecipient.status == "delivered", 1), else_=0)).label("delivered"),
            func.sum(case((CampaignRecipient.status == "opened", 1), else_=0)).label("opened"),
            func.sum(case((CampaignRecipient.status == "converted", 1), else_=0)).label("converted"),
        )
        .outerjoin(CampaignRecipient, CampaignRecipient.campaign_id == Campaign.id)
        .group_by(Campaign.id, Campaign.name, Campaign.type, Campaign.status, Campaign.sent_at)
        .order_by(Campaign.sent_at.desc().nullslast())
        .limit(50)
    )
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "type": r.type.value,
            "status": r.status.value,
            "sent_at": r.sent_at.isoformat() if r.sent_at else None,
            "total_recipients": r.total_recipients or 0,
            "sent": r.sent or 0,
            "delivered": r.delivered or 0,
            "opened": r.opened or 0,
            "converted": r.converted or 0,
            "delivery_rate": round((r.delivered or 0) / r.total_recipients * 100, 1) if r.total_recipients else 0,
            "conversion_rate": round((r.converted or 0) / r.total_recipients * 100, 1) if r.total_recipients else 0,
        }
        for r in result.all()
    ]


# ── Average spend ─────────────────────────────────────────────────────────────

@router.get("/avg-spend")
async def average_spend(
    branch_id: Optional[uuid.UUID] = None,
    period: str = Query("month", enum=["week", "month", "year"]),
    db: AsyncSession = Depends(get_db),
):
    start = _period_start(period)
    filters = [Order.status == OrderStatus.delivered, Order.created_at >= start]
    if branch_id:
        filters.append(Order.branch_id == branch_id)

    result = await db.execute(
        select(
            func.avg(Order.total_amount).label("avg"),
            func.min(Order.total_amount).label("min"),
            func.max(Order.total_amount).label("max"),
            func.percentile_cont(0.5).within_group(Order.total_amount).label("median"),
        ).where(and_(*filters))
    )
    r = result.one()
    return {
        "avg_spend": float(r.avg or 0),
        "min_spend": float(r.min or 0),
        "max_spend": float(r.max or 0),
        "median_spend": float(r.median or 0),
    }
