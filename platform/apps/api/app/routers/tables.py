import uuid
from typing import Optional
from datetime import date, time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.database import get_db
from app.models.table import CafeTable, TableStatus, TableType
from app.models.reservation import Reservation, ReservationStatus
from app.middleware.auth import require_staff, require_admin
from app.schemas.tables import TableUpdate

router = APIRouter(prefix="/tables", tags=["tables"])

ACTIVE_RESERVATION_STATUSES = [
    ReservationStatus.pending,
    ReservationStatus.confirmed,
    ReservationStatus.checked_in,
]


class TableStatusUpdate(BaseModel):
    status: TableStatus


@router.get("")
async def list_tables(branch_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CafeTable).where(CafeTable.branch_id == branch_id).order_by(CafeTable.table_number)
    )
    tables = result.scalars().all()
    return [_table_dict(t) for t in tables]


@router.get("/availability")
async def get_availability(
    branch_id: uuid.UUID,
    reservation_date: date,
    reservation_time: time,
    guests: int,
    db: AsyncSession = Depends(get_db),
):
    """Return tables that are available for a given slot and guest count."""
    # Get all tables with sufficient capacity
    result = await db.execute(
        select(CafeTable).where(
            and_(
                CafeTable.branch_id == branch_id,
                CafeTable.capacity >= guests,
                CafeTable.status != TableStatus.out_of_service,
            )
        ).order_by(CafeTable.table_number)
    )
    tables = result.scalars().all()

    # Find tables already reserved at this date+time
    reserved_result = await db.execute(
        select(Reservation.table_id).where(
            and_(
                Reservation.branch_id == branch_id,
                Reservation.reservation_date == reservation_date,
                Reservation.reservation_time == reservation_time,
                Reservation.status.in_(ACTIVE_RESERVATION_STATUSES),
            )
        )
    )
    reserved_ids = {row[0] for row in reserved_result.all()}

    available = [t for t in tables if t.id not in reserved_ids]
    return [_table_dict(t) for t in available]


@router.patch("/{table_id}/status", dependencies=[Depends(require_staff)])
async def update_table_status(
    table_id: uuid.UUID,
    payload: TableStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CafeTable).where(CafeTable.id == table_id))
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    table.status = payload.status
    await db.commit()
    return _table_dict(table)


@router.put("/{table_id}", dependencies=[Depends(require_admin)])
async def update_table(table_id: uuid.UUID, payload: TableUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CafeTable).where(CafeTable.id == table_id))
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(table, k, v)
    await db.commit()
    return _table_dict(table)


def _table_dict(t: CafeTable) -> dict:
    return {
        "id": str(t.id),
        "table_number": t.table_number,
        "table_type": t.table_type.value,
        "capacity": t.capacity,
        "status": t.status.value,
        "position_x": t.position_x,
        "position_y": t.position_y,
    }
