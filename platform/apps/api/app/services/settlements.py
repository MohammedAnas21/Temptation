"""Daily settlement generation service.
Aggregates payments and orders into the daily_settlements table."""
import logging
from datetime import date, datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, text

from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.order import Order, OrderStatus

logger = logging.getLogger(__name__)


async def generate_daily_settlement(db: AsyncSession, settlement_date: date | None = None):
    """Generate or update the daily settlement for a given date.
    Defaults to yesterday if no date is provided."""
    if settlement_date is None:
        settlement_date = date.today() - timedelta(days=1)

    start = datetime.combine(settlement_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    # Get all active branches
    branch_result = await db.execute(text("SELECT id FROM branches WHERE is_active = true"))
    branches = branch_result.fetchall()

    for branch_row in branches:
        branch_id = branch_row[0]

        # Count orders
        order_count_result = await db.execute(
            select(func.count(Order.id)).where(
                Order.branch_id == branch_id,
                Order.created_at >= start,
                Order.created_at < end,
                Order.status != OrderStatus.cancelled,
            )
        )
        total_orders = order_count_result.scalar() or 0

        # Total revenue (from delivered orders)
        revenue_result = await db.execute(
            select(func.sum(Order.total_amount)).where(
                Order.branch_id == branch_id,
                Order.created_at >= start,
                Order.created_at < end,
                Order.status == OrderStatus.delivered,
            )
        )
        total_revenue = float(revenue_result.scalar() or 0)

        # Total refunds
        refund_result = await db.execute(
            select(func.sum(Payment.amount)).where(
                Payment.branch_id == branch_id,
                Payment.created_at >= start,
                Payment.created_at < end,
                Payment.status == PaymentStatus.refunded,
            )
        )
        total_refunds = float(refund_result.scalar() or 0)

        # Cash collected (orders paid with cash)
        cash_result = await db.execute(
            select(func.sum(Order.total_amount)).where(
                Order.branch_id == branch_id,
                Order.created_at >= start,
                Order.created_at < end,
                Order.status == OrderStatus.delivered,
                Order.payment_method == "cash",
            )
        )
        cash_collected = float(cash_result.scalar() or 0)

        # PhonePe collected
        phonepe_result = await db.execute(
            select(func.sum(Payment.amount)).where(
                Payment.branch_id == branch_id,
                Payment.created_at >= start,
                Payment.created_at < end,
                Payment.status == PaymentStatus.success,
                Payment.method == PaymentMethod.phonepe,
            )
        )
        phonepe_collected = float(phonepe_result.scalar() or 0)

        net_revenue = total_revenue - total_refunds

        # Upsert settlement record
        await db.execute(
            text("""
                INSERT INTO daily_settlements (id, branch_id, settlement_date, total_orders, total_revenue, total_refunds, net_revenue, cash_collected, phonepe_collected, created_at)
                VALUES (gen_random_uuid(), :branch_id, :settlement_date, :total_orders, :total_revenue, :total_refunds, :net_revenue, :cash_collected, :phonepe_collected, now())
                ON CONFLICT (branch_id, settlement_date)
                DO UPDATE SET
                    total_orders = EXCLUDED.total_orders,
                    total_revenue = EXCLUDED.total_revenue,
                    total_refunds = EXCLUDED.total_refunds,
                    net_revenue = EXCLUDED.net_revenue,
                    cash_collected = EXCLUDED.cash_collected,
                    phonepe_collected = EXCLUDED.phonepe_collected
            """),
            {
                "branch_id": branch_id,
                "settlement_date": settlement_date,
                "total_orders": total_orders,
                "total_revenue": total_revenue,
                "total_refunds": total_refunds,
                "net_revenue": net_revenue,
                "cash_collected": cash_collected,
                "phonepe_collected": phonepe_collected,
            },
        )

    await db.commit()
    logger.info(f"Daily settlement generated for {settlement_date} across {len(branches)} branches")
    return {
        "date": str(settlement_date),
        "branches_processed": len(branches),
    }


async def get_settlement_report(
    db: AsyncSession,
    branch_id: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    skip: int = 0,
    limit: int = 30,
) -> dict:
    """Query settlement records for reporting."""
    conditions = []
    params: dict = {"skip": skip, "limit": limit}

    if branch_id:
        conditions.append("branch_id = :branch_id")
        params["branch_id"] = branch_id
    if start_date:
        conditions.append("settlement_date >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("settlement_date <= :end_date")
        params["end_date"] = end_date

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    result = await db.execute(
        text(f"""
            SELECT id, branch_id, settlement_date, total_orders, total_revenue,
                   total_refunds, net_revenue, cash_collected, phonepe_collected, created_at
            FROM daily_settlements
            {where_clause}
            ORDER BY settlement_date DESC
            OFFSET :skip LIMIT :limit
        """),
        params,
    )
    rows = result.fetchall()

    # Totals
    totals_result = await db.execute(
        text(f"""
            SELECT COALESCE(SUM(total_orders), 0), COALESCE(SUM(total_revenue), 0),
                   COALESCE(SUM(total_refunds), 0), COALESCE(SUM(net_revenue), 0),
                   COALESCE(SUM(cash_collected), 0), COALESCE(SUM(phonepe_collected), 0)
            FROM daily_settlements {where_clause}
        """),
        params,
    )
    totals_row = totals_result.one()

    return {
        "settlements": [
            {
                "id": str(row[0]),
                "branch_id": str(row[1]),
                "date": str(row[2]),
                "total_orders": row[3],
                "total_revenue": float(row[4]),
                "total_refunds": float(row[5]),
                "net_revenue": float(row[6]),
                "cash_collected": float(row[7]),
                "phonepe_collected": float(row[8]),
            }
            for row in rows
        ],
        "totals": {
            "total_orders": int(totals_row[0]),
            "total_revenue": float(totals_row[1]),
            "total_refunds": float(totals_row[2]),
            "net_revenue": float(totals_row[3]),
            "cash_collected": float(totals_row[4]),
            "phonepe_collected": float(totals_row[5]),
        },
    }


async def get_payment_audit_trail(
    db: AsyncSession,
    payment_id: str | None = None,
    user_id: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[dict]:
    """Get payment event audit trail."""
    conditions = []
    params: dict = {"skip": skip, "limit": limit}

    if payment_id:
        conditions.append("pe.payment_id = :payment_id")
        params["payment_id"] = payment_id
    if user_id:
        conditions.append("p.user_id = :user_id")
        params["user_id"] = user_id

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    result = await db.execute(
        text(f"""
            SELECT pe.id, pe.payment_id, pe.event_type, pe.created_at,
                   p.amount, p.status, p.method, p.gateway_txn_id
            FROM payment_events pe
            JOIN payments p ON p.id = pe.payment_id
            {where_clause}
            ORDER BY pe.created_at DESC
            OFFSET :skip LIMIT :limit
        """),
        params,
    )
    rows = result.fetchall()

    return [
        {
            "event_id": str(row[0]),
            "payment_id": str(row[1]),
            "event_type": row[2],
            "created_at": row[3].isoformat() if row[3] else None,
            "amount": float(row[4]),
            "payment_status": row[5],
            "payment_method": row[6],
            "gateway_txn_id": row[7],
        }
        for row in rows
    ]
