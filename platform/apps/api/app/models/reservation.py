import uuid
from typing import Optional
from datetime import date, time, datetime
from sqlalchemy import Date, Time, Integer, Numeric, Boolean, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin
import enum


class SeatingType(str, enum.Enum):
    standard = "standard"
    dining = "dining"
    premium_sofa = "premium_sofa"
    private_sofa = "private_sofa"


class ReservationStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    checked_in = "checked_in"
    checked_out = "checked_out"
    cancelled = "cancelled"
    no_show = "no_show"


class Reservation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reservations"

    branch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=False, index=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    table_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cafe_tables.id"), nullable=False, index=True)
    reservation_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    reservation_time: Mapped[time] = mapped_column(Time, nullable=False)
    guest_count: Mapped[int] = mapped_column(Integer, nullable=False)
    seating_type: Mapped[SeatingType] = mapped_column(SAEnum(SeatingType), nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(SAEnum(ReservationStatus), nullable=False, default=ReservationStatus.pending, index=True)
    deposit_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=200.0, nullable=False)
    deposit_paid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    payment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=True)
    special_requests: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    whatsapp_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    push_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    checked_in_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    checked_out_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    customer: Mapped["User"] = relationship(back_populates="reservations")
    table: Mapped["CafeTable"] = relationship(back_populates="reservations")
    status_history: Mapped[list["ReservationStatusHistory"]] = relationship(back_populates="reservation", cascade="all, delete-orphan")


class ReservationStatusHistory(Base, UUIDMixin):
    __tablename__ = "reservation_status_history"

    reservation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("reservations.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[ReservationStatus] = mapped_column(SAEnum(ReservationStatus), nullable=False)
    changed_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    reservation: Mapped["Reservation"] = relationship(back_populates="status_history")
