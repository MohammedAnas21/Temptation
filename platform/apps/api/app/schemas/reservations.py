"""Pydantic schemas for reservation operations."""
import uuid
from datetime import date, time
from typing import Optional
from pydantic import BaseModel, Field
from app.models.reservation import SeatingType, ReservationStatus


class ReservationCreateRequest(BaseModel):
    branch_id: uuid.UUID
    table_id: uuid.UUID
    reservation_date: date
    reservation_time: time
    guest_count: int = Field(ge=1, le=20)
    seating_type: SeatingType
    special_requests: Optional[str] = Field(None, max_length=500)


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus


class OccupancyQuery(BaseModel):
    branch_id: uuid.UUID
    query_date: date
