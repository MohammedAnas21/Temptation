import uuid
from typing import Optional
from datetime import date, time, datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field, model_validator
from app.database import get_db
from app.models.reservation import Reservation, ReservationStatus, ReservationStatusHistory, SeatingType
from app.models.table import CafeTable, TableStatus
from app.models.user import User
from app.middleware.auth import get_current_user, require_staff
from app.services.automation import on_reservation_cancelled
from app.config import get_settings
from app.middleware.audit import log_audit

router = APIRouter(prefix="/reservations", tags=["reservations"])
settings = get_settings()

ACTIVE_STATUSES = [
    ReservationStatus.pending,
    ReservationStatus.confirmed,
    ReservationStatus.checked_in,
]


class ReservationCreate(BaseModel):
    branch_id: uuid.UUID
    table_id: uuid.UUID
    reservation_date: date
    reservation_time: time
    guest_count: int = Field(..., ge=1, le=20)
    seating_type: SeatingType
    special_requests: Optional[str] = Field(None, max_length=500)

    @model_validator(mode="after")
    def validate_reservation_slot(self) -> "ReservationCreate":
        now = datetime.now(timezone.utc)
        requested = datetime.combine(self.reservation_date, self.reservation_time, tzinfo=timezone.utc)
        if requested < now:
            raise ValueError("Reservation date and time must be in the future")
        if self.reservation_date > date.today() + timedelta(days=180):
            raise ValueError("Reservation date cannot be more than 180 days in the future")
        return self


class StatusUpdate(BaseModel):
    status: ReservationStatus


@router.post("")
async def create_reservation(
    payload: ReservationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    t_result = await db.execute(select(CafeTable).where(CafeTable.id == payload.table_id))
    table = t_result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    if table.branch_id != payload.branch_id:
        raise HTTPException(status_code=400, detail="Table does not belong to the specified branch")
    if table.capacity < payload.guest_count:
        raise HTTPException(status_code=400, detail=f"Table capacity is {table.capacity}, requested {payload.guest_count}")

    conflict = await db.execute(
        select(Reservation).where(
            and_(
                Reservation.table_id == payload.table_id,
                Reservation.reservation_date == payload.reservation_date,
                Reservation.reservation_time == payload.reservation_time,
                Reservation.status.in_(ACTIVE_STATUSES),
            )
        )
    )
    if conflict.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Table already reserved for this slot")

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.reservation_expiry_minutes)

    reservation = Reservation(
        branch_id=payload.branch_id,
        customer_id=user.id,
        table_id=payload.table_id,
        reservation_date=payload.reservation_date,
        reservation_time=payload.reservation_time,
        guest_count=payload.guest_count,
        seating_type=payload.seating_type,
        special_requests=payload.special_requests,
        deposit_amount=settings.reservation_deposit_amount,
        status=ReservationStatus.pending,
        expires_at=expires_at,
    )
    db.add(reservation)
    if table.status == TableStatus.available:
        table.status = TableStatus.reserved

    history = ReservationStatusHistory(
        reservation_id=reservation.id,
        status=ReservationStatus.pending,
        changed_by=user.id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(history)

    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Table already reserved for this slot")

    await log_audit(db, "reservation_created", "reservation", reservation.id, user.id,
                    None, {"table_id": str(payload.table_id), "date": str(payload.reservation_date)})
    await db.commit()
    await db.refresh(reservation)
    return _reservation_dict(reservation)


@router.get("/occupancy/{branch_id}", dependencies=[Depends(require_staff)])
async def get_occupancy(
    branch_id: uuid.UUID,
    query_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Occupancy tracking: reservation slots and capacity for a given date."""
    from sqlalchemy import func as sa_func
    result = await db.execute(
        select(
            Reservation.reservation_time,
            sa_func.count(Reservation.id).label("booked"),
            sa_func.sum(Reservation.guest_count).label("guests"),
        )
        .where(
            Reservation.branch_id == branch_id,
            Reservation.reservation_date == query_date,
            Reservation.status.in_([ReservationStatus.confirmed, ReservationStatus.checked_in]),
        )
        .group_by(Reservation.reservation_time)
        .order_by(Reservation.reservation_time)
    )
    rows = result.all()

    # Get total tables and capacity
    table_result = await db.execute(
        select(sa_func.count(CafeTable.id), sa_func.sum(CafeTable.capacity))
        .where(CafeTable.branch_id == branch_id, CafeTable.status != TableStatus.out_of_service)
    )
    table_row = table_result.one()
    total_tables = table_row[0] or 0
    total_capacity = int(table_row[1] or 0)

    slots = []
    total_booked = 0
    total_guests = 0
    for row in rows:
        booked = row.booked
        guests = int(row.guests or 0)
        total_booked += booked
        total_guests += guests
        slots.append({
            "time": str(row.reservation_time)[:5],
            "booked_tables": booked,
            "guests": guests,
            "available_tables": max(0, total_tables - booked),
            "occupancy_pct": round(booked / total_tables * 100, 1) if total_tables > 0 else 0,
        })

    return {
        "date": str(query_date),
        "total_tables": total_tables,
        "total_capacity": total_capacity,
        "total_booked": total_booked,
        "total_guests": total_guests,
        "overall_occupancy_pct": round(total_booked / total_tables * 100, 1) if total_tables > 0 else 0,
        "slots": slots,
    }


@router.get("/peak-hours/{branch_id}", dependencies=[Depends(require_staff)])
async def get_peak_hours(
    branch_id: uuid.UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """Peak hour analytics: busiest time slots over a date range."""
    from sqlalchemy import func as sa_func, extract
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()

    result = await db.execute(
        select(
            Reservation.reservation_time,
            sa_func.count(Reservation.id).label("count"),
            sa_func.sum(Reservation.guest_count).label("guests"),
        )
        .where(
            Reservation.branch_id == branch_id,
            Reservation.reservation_date.between(start_date, end_date),
            Reservation.status.in_([ReservationStatus.confirmed, ReservationStatus.checked_in, ReservationStatus.checked_out]),
        )
        .group_by(Reservation.reservation_time)
        .order_by(sa_func.count(Reservation.id).desc())
    )
    rows = result.all()

    return {
        "branch_id": str(branch_id),
        "period": {"start": str(start_date), "end": str(end_date)},
        "peak_hours": [
            {
                "time": str(row.reservation_time)[:5],
                "reservation_count": row.count,
                "total_guests": int(row.guests or 0),
            }
            for row in rows
        ],
    }


@router.get("/my")
async def my_reservations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Reservation).where(Reservation.customer_id == user.id).order_by(Reservation.reservation_date.desc())
    )
    return [_reservation_dict(r) for r in result.scalars().all()]


@router.get("/{reservation_id}")
async def get_reservation(
    reservation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Reservation).where(Reservation.id == reservation_id))
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if user.role.value == "customer" and r.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return _reservation_dict(r)


@router.post("/{reservation_id}/cancel")
async def cancel_reservation(
    reservation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Reservation).where(Reservation.id == reservation_id))
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if user.role.value == "customer" and r.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if r.status not in (ReservationStatus.pending, ReservationStatus.confirmed):
        raise HTTPException(status_code=400, detail=f"Cannot cancel reservation with status: {r.status.value}")

    old_status = r.status
    r.status = ReservationStatus.cancelled
    history = ReservationStatusHistory(
        reservation_id=r.id,
        status=ReservationStatus.cancelled,
        changed_by=user.id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(history)

    t_res = await db.execute(select(CafeTable).where(CafeTable.id == r.table_id))
    table = t_res.scalar_one_or_none()
    if table and table.status in (TableStatus.reserved, TableStatus.occupied):
        table.status = TableStatus.available

    u_res = await db.execute(select(User).where(User.id == r.customer_id))
    customer = u_res.scalar_one_or_none()
    if customer:
        await on_reservation_cancelled(db, r, customer)

    await log_audit(
        db,
        "reservation_cancelled",
        "reservation",
        r.id,
        user.id,
        {"status": old_status.value},
        {"status": ReservationStatus.cancelled.value},
    )

    # Notify waiting list that a slot freed up
    await _notify_waiting_list(db, r.branch_id, r.reservation_date, r.reservation_time, r.guest_count)

    await db.commit()
    return _reservation_dict(r)


@router.post("/{reservation_id}/check-in", dependencies=[Depends(require_staff)])
async def check_in_reservation(
    reservation_id: uuid.UUID,
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    return await update_reservation_status(
        reservation_id,
        StatusUpdate(status=ReservationStatus.checked_in),
        user,
        db,
    )


@router.post("/{reservation_id}/check-out", dependencies=[Depends(require_staff)])
async def check_out_reservation(
    reservation_id: uuid.UUID,
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    return await update_reservation_status(
        reservation_id,
        StatusUpdate(status=ReservationStatus.checked_out),
        user,
        db,
    )


@router.post("/{reservation_id}/no-show", dependencies=[Depends(require_staff)])
async def mark_reservation_no_show(
    reservation_id: uuid.UUID,
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    return await update_reservation_status(
        reservation_id,
        StatusUpdate(status=ReservationStatus.no_show),
        user,
        db,
    )


@router.patch("/{reservation_id}/status", dependencies=[Depends(require_staff)])
async def update_reservation_status(
    reservation_id: uuid.UUID,
    payload: StatusUpdate,
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Reservation).where(Reservation.id == reservation_id))
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")

    old_status = r.status
    r.status = payload.status

    if payload.status == ReservationStatus.checked_in:
        r.checked_in_at = datetime.now(timezone.utc)
        t_res = await db.execute(select(CafeTable).where(CafeTable.id == r.table_id))
        table = t_res.scalar_one_or_none()
        if table:
            table.status = TableStatus.occupied

    elif payload.status == ReservationStatus.checked_out:
        r.checked_out_at = datetime.now(timezone.utc)
        from app.services.automation import on_reservation_checked_out
        u_res = await db.execute(select(User).where(User.id == r.customer_id))
        customer = u_res.scalar_one_or_none()
        if customer:
            await on_reservation_checked_out(db, r, customer)
        t_res = await db.execute(select(CafeTable).where(CafeTable.id == r.table_id))
        table = t_res.scalar_one_or_none()
        if table:
            table.status = TableStatus.cleaning

    elif payload.status in (ReservationStatus.cancelled, ReservationStatus.no_show):
        u_res = await db.execute(select(User).where(User.id == r.customer_id))
        customer = u_res.scalar_one_or_none()
        if customer:
            await on_reservation_cancelled(db, r, customer)
        t_res = await db.execute(select(CafeTable).where(CafeTable.id == r.table_id))
        table = t_res.scalar_one_or_none()
        if table and table.status in (TableStatus.reserved, TableStatus.occupied):
            table.status = TableStatus.available

    history = ReservationStatusHistory(
        reservation_id=r.id, status=payload.status,
        changed_by=user.id, created_at=datetime.now(timezone.utc),
    )
    db.add(history)
    await log_audit(db, f"reservation_{payload.status.value}", "reservation", r.id, user.id,
                    {"status": old_status.value}, {"status": payload.status.value})
    await db.commit()
    return _reservation_dict(r)


@router.get("", dependencies=[Depends(require_staff)])
async def list_reservations(
    branch_id: Optional[uuid.UUID] = None,
    reservation_date: Optional[date] = None,
    status: Optional[ReservationStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = []
    if branch_id:
        filters.append(Reservation.branch_id == branch_id)
    if reservation_date:
        filters.append(Reservation.reservation_date == reservation_date)
    if status:
        filters.append(Reservation.status == status)
    q = select(Reservation).order_by(Reservation.reservation_date.desc(), Reservation.reservation_time)
    if filters:
        q = q.where(and_(*filters))
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return [_reservation_dict(r) for r in result.scalars().all()]


def _reservation_dict(r: Reservation) -> dict:
    return {
        "id": str(r.id),
        "customer_id": str(r.customer_id),
        "table_id": str(r.table_id),
        "reservation_date": str(r.reservation_date),
        "reservation_time": str(r.reservation_time)[:5],
        "guest_count": r.guest_count,
        "seating_type": r.seating_type.value,
        "status": r.status.value,
        "deposit_amount": float(r.deposit_amount),
        "deposit_paid": r.deposit_paid,
        "special_requests": r.special_requests,
        "whatsapp_sent": r.whatsapp_sent,
        "push_sent": r.push_sent,
        "expires_at": r.expires_at.isoformat() if r.expires_at else None,
        "checked_in_at": r.checked_in_at.isoformat() if r.checked_in_at else None,
        "checked_out_at": r.checked_out_at.isoformat() if r.checked_out_at else None,
        "created_at": r.created_at.isoformat(),
    }


async def _notify_waiting_list(db: AsyncSession, branch_id: uuid.UUID, res_date: date, res_time: time, guest_count: int):
    """Notify waiting list customers when a slot frees up."""
    from sqlalchemy import text as sql_text
    result = await db.execute(
        sql_text("""
            SELECT id, customer_id, guest_count FROM reservation_waiting_list
            WHERE branch_id = :branch_id AND requested_date = :res_date
              AND requested_time = :res_time AND status = 'waiting'
              AND guest_count <= :capacity
            ORDER BY created_at ASC LIMIT 5
        """),
        {"branch_id": str(branch_id), "res_date": res_date, "res_time": res_time, "capacity": guest_count + 4},
    )
    waiters = result.fetchall()
    for waiter in waiters:
        # Send push notification to waiting customer
        user_result = await db.execute(
            select(User).where(User.id == waiter.customer_id)
        )
        user = user_result.scalar_one_or_none()
        if user and user.fcm_token:
            from app.integrations.fcm import send_push_notification
            await send_push_notification(
                user.fcm_token,
                "Table Available! 🍽️",
                f"A table for {waiter.guest_count} on {res_date} at {str(res_time)[:5]} just opened up. Book now!",
                {"type": "waiting_list", "date": str(res_date), "time": str(res_time)[:5]},
            )
        # Mark as notified
        await db.execute(
            sql_text("UPDATE reservation_waiting_list SET status = 'notified', notified_at = now() WHERE id = :wid"),
            {"wid": str(waiter.id)},
        )
