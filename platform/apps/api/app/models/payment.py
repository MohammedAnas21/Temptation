import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin
import enum


class PaymentReferenceType(str, enum.Enum):
    order = "order"
    reservation = "reservation"


class PaymentMethod(str, enum.Enum):
    phonepe = "phonepe"
    upi = "upi"
    cash = "cash"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"
    refunded = "refunded"


class Payment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "payments"

    branch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    reference_type: Mapped[PaymentReferenceType] = mapped_column(SAEnum(PaymentReferenceType), nullable=False)
    reference_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(SAEnum(PaymentMethod), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(SAEnum(PaymentStatus), nullable=False, default=PaymentStatus.pending, index=True)
    gateway_txn_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    gateway_response: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)

    events: Mapped[list["PaymentEvent"]] = relationship(back_populates="payment", cascade="all, delete-orphan")


class PaymentEvent(Base, UUIDMixin):
    __tablename__ = "payment_events"

    payment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    event_hash: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True, index=True)
    payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    payment: Mapped["Payment"] = relationship(back_populates="events")
