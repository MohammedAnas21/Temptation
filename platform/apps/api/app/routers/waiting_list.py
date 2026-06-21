"""Reservation waiting list system."""
import uuid
from datetime import date, time, datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, text
from pydantic import BaseModel, Field
from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user, require_staff

router = APIRouter(prefix="/waiting-list", tags=["waiting-list"])


class WaitingListEntry(BaseModel):
    branch_id: uuid.UUID
    requested_date: date
    requested_time: time
    guest_count: int = Field(..., ge=1, le=20)
    seating_type: str


@router.post("")
async def join_waiting_list(
    payload: WaitingListEntry,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add customer to waiting list for a fully-booked slot."""
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    await db.execute(text("""
        INSERT INTO reservation_waiting_list
            (branch_id, customer_id, requested_date, requested_time,
             guest_count, seating_type, expires_at)
        VALUES
            (:branch_id, :customer_id, :requested_date, :requested_time,
             :guest_count, :seating_type, :expires_at)
    """), {
        "branch_id": str(payload.branch_id),
        "customer_id": str(user.id),
        "requested_date": str(payload.requested_date),
        "requested_time": str(payload.requested_time),
        "guest_count": payload.guest_count,
        "seating_type": payload.seating_type,
        "expires_at": expires_at.isoformat(),
    })
    await db.commit()
    return {"message": "Added to waiting list. We'll notify you when a table becomes available."}


@router.get("/my")
async def my_waiting_list(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(text("""
        SELECT id, requested_date, requested_time, guest_count, seating_type, status, created_at
        FROM reservation_waiting_list
        WHERE customer_id = :user_id AND status = 'waiting'
        ORDER BY created_at DESC
    """), {"user_id": str(user.id)})
    rows = result.mappings().all()
    return [dict(r) for r in rows]


@router.delete("/{entry_id}")
async def leave_waiting_list(
    entry_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(text("""
        UPDATE reservation_waiting_list
        SET status = 'cancelled'
        WHERE id = :id AND customer_id = :user_id
    """), {"id": str(entry_id), "user_id": str(user.id)})
    await db.commit()
    return {"message": "Removed from waiting list"}


@router.get("", dependencies=[Depends(require_staff)])
async def list_waiting_entries(
    branch_id: Optional[uuid.UUID] = None,
    requested_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """Staff: view all waiting list entries."""
    params: dict = {}
    where = "WHERE w.status = 'waiting'"
    if branch_id:
        where += " AND w.branch_id = :branch_id"
        params["branch_id"] = str(branch_id)
    if requested_date:
        where += " AND w.requested_date = :requested_date"
        params["requested_date"] = str(requested_date)

    result = await db.execute(text(f"""
        SELECT w.id, w.requested_date, w.requested_time, w.guest_count,
               w.seating_type, w.status, w.created_at,
               u.name AS customer_name, u.phone AS customer_phone
        FROM reservation_waiting_list w
        JOIN users u ON u.id = w.customer_id
        {where}
        ORDER BY w.requested_date, w.requested_time, w.created_at
    """), params)
    return [dict(r) for r in result.mappings().all()]
