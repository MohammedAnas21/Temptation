"""
Automation workflow service.
All post-action side-effects run here: notifications, CRM, loyalty, scheduling.
WhatsApp and FCM calls are fire-and-forget (errors logged, not raised).
"""
import uuid
import logging
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, text
from app.models.user import User
from app.models.reservation import Reservation, ReservationStatus
from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentStatus, PaymentReferenceType
from app.models.loyalty import LoyaltyTransactionType
from app.services.loyalty import award_points, earn_from_order

logger = logging.getLogger(__name__)

# ── Lazy imports for integrations to avoid circular imports ───────────────────

async def _wa(phone: str, template: str, components: list | None = None) -> bool:
    try:
        from app.integrations.whatsapp import send_whatsapp_template
        return await send_whatsapp_template(phone, template, components=components or [])
    except Exception as e:
        logger.warning(f"WhatsApp send failed silently: {e}")
        return False

async def _push(token: str, title: str, body: str, data: dict | None = None) -> bool:
    try:
        from app.integrations.fcm import send_push_notification
        return await send_push_notification(token=token, title=title, body=body, data=data or {})
    except Exception as e:
        logger.warning(f"FCM push failed silently: {e}")
        return False


# ── Reservation workflows ─────────────────────────────────────────────────────

async def on_reservation_confirmed(db: AsyncSession, reservation: Reservation, user: User) -> None:
    """Reservation Confirmed → reserve table, WhatsApp + FCM."""
    from app.models.table import CafeTable, TableStatus

    if reservation.table_id:
        table_result = await db.execute(select(CafeTable).where(CafeTable.id == reservation.table_id))
        table = table_result.scalar_one_or_none()
        if table and table.status == TableStatus.available:
            table.status = TableStatus.reserved

    if user.phone and not reservation.whatsapp_sent:
        components = [{"type": "body", "parameters": [
            {"type": "text", "text": user.name or "Guest"},
            {"type": "text", "text": str(reservation.reservation_date)},
            {"type": "text", "text": str(reservation.reservation_time)[:5]},
            {"type": "text", "text": str(reservation.guest_count)},
            {"type": "text", "text": f"Table {reservation.table_id}"},
        ]}]
        if await _wa(user.phone, "reservation_confirmation", components):
            reservation.whatsapp_sent = True

    if user.fcm_token and not reservation.push_sent:
        if await _push(
            user.fcm_token,
            "Reservation Confirmed! 🎉",
            f"Table for {reservation.guest_count} on {reservation.reservation_date} at {str(reservation.reservation_time)[:5]}",
            {"type": "reservation", "id": str(reservation.id)},
        ):
            reservation.push_sent = True

    await db.flush()
    logger.info(f"Reservation confirmed workflow: {reservation.id}")


async def on_reservation_checked_out(db: AsyncSession, reservation: Reservation, user: User) -> None:
    """Check-out → Award visit points + push notification."""
    from app.config import get_settings
    settings = get_settings()
    await award_points(
        db, user.id, settings.reservation_checkin_points,
        LoyaltyTransactionType.reservation_checkin,
        reservation.id, f"Visit reward — reservation {str(reservation.id)[:8]}"
    )
    if user.fcm_token:
        await _push(
            user.fcm_token,
            "Thanks for visiting! 😊",
            f"You earned {settings.reservation_checkin_points} loyalty points. See you again!",
            {"type": "loyalty", "points": str(settings.reservation_checkin_points)},
        )
    logger.info(f"Check-out workflow: {reservation.id}")


async def on_reservation_cancelled(db: AsyncSession, reservation: Reservation, user: User) -> None:
    """Reservation Cancelled → notify customer."""
    if user.phone:
        await _wa(user.phone, "reservation_cancelled", [{"type": "body", "parameters": [
            {"type": "text", "text": user.name or "Guest"},
            {"type": "text", "text": str(reservation.reservation_date)},
        ]}])
    if user.fcm_token:
        await _push(user.fcm_token, "Reservation Cancelled", f"Your reservation on {reservation.reservation_date} has been cancelled.", {"type": "reservation", "id": str(reservation.id)})


# ── Order workflows ───────────────────────────────────────────────────────────

async def on_order_confirmed(db: AsyncSession, order: Order, user: User) -> None:
    """Order Confirmed → WhatsApp + FCM."""
    if user.phone:
        await _wa(user.phone, "order_confirmation", [{"type": "body", "parameters": [
            {"type": "text", "text": user.name or "Guest"},
            {"type": "text", "text": str(order.id)[:8].upper()},
            {"type": "text", "text": f"₹{float(order.total_amount):.0f}"},
        ]}])
    if user.fcm_token:
        await _push(user.fcm_token, "Order Confirmed! ✅",
                    f"Order #{str(order.id)[:8].upper()} for ₹{float(order.total_amount):.0f} confirmed.",
                    {"type": "order", "id": str(order.id), "status": "confirmed"})


async def on_order_delivered(db: AsyncSession, order: Order, user: User) -> None:
    """Order Delivered → Award loyalty points + FCM."""
    points_earned = await earn_from_order(db, user.id, float(order.total_amount), order.id)
    if user.fcm_token:
        if points_earned > 0:
            await _push(user.fcm_token, "Points Earned! 🌟",
                        f"You earned {points_earned} loyalty points for your order.",
                        {"type": "loyalty", "points": str(points_earned)})
        await _push(user.fcm_token, "Order Delivered! 🍽️",
                    "Your order has been delivered. Enjoy your meal!",
                    {"type": "order", "id": str(order.id), "status": "delivered"})
    logger.info(f"Order delivered workflow: {order.id}, points: {points_earned}")


# ── Payment workflows ─────────────────────────────────────────────────────────

async def on_payment_success(
    db: AsyncSession,
    payment: Payment,
    user: User,
) -> None:
    """Payment Success → WhatsApp receipt + FCM + CRM + analytics update."""
    # WhatsApp payment receipt
    if user.phone:
        await _wa(user.phone, "payment_confirmation", [{"type": "body", "parameters": [
            {"type": "text", "text": user.name or "Guest"},
            {"type": "text", "text": f"₹{float(payment.amount):.0f}"},
            {"type": "text", "text": payment.gateway_txn_id or str(payment.id)[:8].upper()},
        ]}])

    # FCM notification
    if user.fcm_token:
        await _push(
            user.fcm_token,
            "Payment Successful! 💳",
            f"₹{float(payment.amount):.0f} received. Transaction ID: {(payment.gateway_txn_id or '')[:8].upper()}",
            {"type": "payment", "id": str(payment.id), "status": "success"},
        )

    # If this is an order payment — also trigger order confirmation workflow
    if payment.reference_type == PaymentReferenceType.order:
        r = await db.execute(select(Order).where(Order.id == payment.reference_id))
        order = r.scalar_one_or_none()
        if order and order.status == OrderStatus.confirmed:
            await on_order_confirmed(db, order, user)

    logger.info(f"Payment success workflow: {payment.id}")


# ── Marketing automations ─────────────────────────────────────────────────────

async def send_birthday_campaign(db: AsyncSession) -> int:
    """Run daily: credit birthday points and send WhatsApp to birthday users."""
    from app.config import get_settings
    settings = get_settings()
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(User).where(
            User.is_active == True,
            User.birthday != None,
            func.extract("month", User.birthday) == today.month,
            func.extract("day", User.birthday) == today.day,
        )
    )
    users = result.scalars().all()
    sent = 0
    for user in users:
        try:
            await award_points(
                db, user.id, settings.birthday_bonus_points,
                LoyaltyTransactionType.birthday, None,
                f"Birthday bonus — {today}"
            )
            if user.phone:
                await _wa(user.phone, "birthday_wishes", [{"type": "body", "parameters": [
                    {"type": "text", "text": user.name or "Guest"},
                    {"type": "text", "text": str(settings.birthday_bonus_points)},
                ]}])
            if user.fcm_token:
                await _push(user.fcm_token, "Happy Birthday! 🎂",
                            f"Wishing you a wonderful birthday! We've added {settings.birthday_bonus_points} bonus points to your account.",
                            {"type": "birthday"})
            sent += 1
        except Exception as e:
            logger.error(f"Birthday campaign failed for user {user.id}: {e}")
    await db.commit()
    logger.info(f"Birthday campaign: {sent}/{len(users)} users processed")
    return sent


async def send_anniversary_campaign(db: AsyncSession) -> int:
    """Run daily: credit anniversary points and send WhatsApp to anniversary users."""
    from app.config import get_settings
    settings = get_settings()
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(User).where(
            User.is_active == True,
            User.anniversary != None,
            func.extract("month", User.anniversary) == today.month,
            func.extract("day", User.anniversary) == today.day,
        )
    )
    users = result.scalars().all()
    sent = 0
    for user in users:
        try:
            await award_points(
                db, user.id, settings.anniversary_bonus_points,
                LoyaltyTransactionType.anniversary, None,
                f"Anniversary bonus — {today}"
            )
            if user.phone:
                await _wa(user.phone, "anniversary_wishes", [{"type": "body", "parameters": [
                    {"type": "text", "text": user.name or "Guest"},
                    {"type": "text", "text": str(settings.anniversary_bonus_points)},
                ]}])
            sent += 1
        except Exception as e:
            logger.error(f"Anniversary campaign failed for user {user.id}: {e}")
    await db.commit()
    return sent


async def expire_pending_reservations(db: AsyncSession) -> int:
    """Auto-cancel reservations that have been pending > expiry window."""
    from app.config import get_settings
    settings = get_settings()
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=settings.reservation_expiry_minutes)
    result = await db.execute(
        select(Reservation).where(
            Reservation.status == ReservationStatus.pending,
            Reservation.created_at < cutoff,
        )
    )
    expired = result.scalars().all()
    for r in expired:
        r.status = ReservationStatus.cancelled
        # Free the table
        from app.models.table import CafeTable, TableStatus
        t = await db.execute(select(CafeTable).where(CafeTable.id == r.table_id))
        table = t.scalar_one_or_none()
        if table and table.status == TableStatus.reserved:
            table.status = TableStatus.available
    if expired:
        await db.commit()
    logger.info(f"Expired {len(expired)} pending reservations")
    return len(expired)


async def detect_no_show_reservations(db: AsyncSession) -> int:
    """Mark confirmed reservations as no-show after their local grace window passes."""
    from app.config import get_settings
    from app.models.table import CafeTable, TableStatus

    settings = get_settings()
    now_local = datetime.now(ZoneInfo("Asia/Kolkata"))
    cutoff_local = now_local - timedelta(minutes=settings.reservation_no_show_grace_minutes)

    result = await db.execute(
        select(Reservation).where(
            Reservation.status == ReservationStatus.confirmed,
            Reservation.reservation_date <= cutoff_local.date(),
        )
    )
    candidates = result.scalars().all()
    marked = 0

    for reservation in candidates:
        slot_local = datetime.combine(
            reservation.reservation_date,
            reservation.reservation_time,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )
        if slot_local > cutoff_local:
            continue

        reservation.status = ReservationStatus.no_show
        table_result = await db.execute(select(CafeTable).where(CafeTable.id == reservation.table_id))
        table = table_result.scalar_one_or_none()
        if table and table.status in (TableStatus.reserved, TableStatus.occupied):
            table.status = TableStatus.available
        marked += 1

    if marked:
        await db.commit()
    logger.info(f"Marked {marked} reservations as no-show")
    return marked


async def send_reservation_reminders(db: AsyncSession) -> int:
    """Send WhatsApp reminders for reservations happening in the next 24 hours."""
    now = datetime.now(timezone.utc)
    tomorrow = (now + timedelta(hours=24)).date()
    result = await db.execute(
        select(Reservation).where(
            Reservation.status == ReservationStatus.confirmed,
            Reservation.reservation_date == tomorrow,
            Reservation.whatsapp_sent == True,  # Only remind confirmed+notified ones
        )
    )
    reservations = result.scalars().all()
    sent = 0
    for r in reservations:
        u_res = await db.execute(select(User).where(User.id == r.customer_id))
        user = u_res.scalar_one_or_none()
        if user and user.phone:
            ok = await _wa(user.phone, "reservation_reminder", [{"type": "body", "parameters": [
                {"type": "text", "text": user.name or "Guest"},
                {"type": "text", "text": str(r.reservation_date)},
                {"type": "text", "text": str(r.reservation_time)[:5]},
                {"type": "text", "text": str(r.guest_count)},
            ]}])
            if ok:
                sent += 1
    logger.info(f"Reservation reminders: {sent}/{len(reservations)} sent")
    return sent


async def send_review_requests(db: AsyncSession) -> int:
    """Send review requests 2 hours after checkout."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
    two_hours_ago_lower = datetime.now(timezone.utc) - timedelta(hours=3)
    result = await db.execute(
        select(Reservation).where(
            Reservation.status == ReservationStatus.checked_out,
            Reservation.checked_out_at.between(two_hours_ago_lower, cutoff),
        )
    )
    reservations = result.scalars().all()
    sent = 0
    for r in reservations:
        u_res = await db.execute(select(User).where(User.id == r.customer_id))
        user = u_res.scalar_one_or_none()
        if user and user.phone:
            ok = await _wa(user.phone, "review_request", [{"type": "body", "parameters": [
                {"type": "text", "text": user.name or "Guest"},
            ]}])
            if ok:
                sent += 1
    return sent


async def send_reengagement_campaign(db: AsyncSession) -> int:
    """Re-engage customers who haven't visited in 60 days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=60)
    # Find users with last order older than 60 days
    subq = (
        select(Order.customer_id)
        .where(Order.created_at > cutoff)
        .scalar_subquery()
    )
    result = await db.execute(
        select(User).where(
            User.is_active == True,
            User.role == "customer",
            ~User.id.in_(subq),
        ).limit(100)  # Process in batches
    )
    users = result.scalars().all()
    sent = 0
    for user in users:
        if user.phone:
            ok = await _wa(user.phone, "reengagement", [{"type": "body", "parameters": [
                {"type": "text", "text": user.name or "Guest"},
            ]}])
            if ok:
                sent += 1
        elif user.fcm_token:
            await _push(user.fcm_token, "We miss you! 🍽️",
                        "It's been a while. Come back for a special treat at Temptations Cafe!",
                        {"type": "reengagement"})
            sent += 1
    logger.info(f"Re-engagement: {sent}/{len(users)} users contacted")
    return sent


async def cleanup_expired_waiting_list(db: AsyncSession) -> int:
    """Expire waiting list entries whose notification window has passed."""
    result = await db.execute(text("""
        UPDATE reservation_waiting_list
        SET status = 'expired', updated_at = now()
        WHERE status IN ('waiting', 'notified') AND expires_at < now()
        RETURNING id
    """))
    rows = result.fetchall()
    count = len(rows)
    if count:
        await db.commit()
    logger.info(f"Expired {count} waiting list entries")
    return count
