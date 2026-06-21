import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Numeric, Integer, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin
import enum


class CouponType(str, enum.Enum):
    percentage = "percentage"
    flat = "flat"


class Coupon(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "coupons"

    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    type: Mapped[CouponType] = mapped_column(SAEnum(CouponType), nullable=False)
    value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    min_order_value: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    max_discount: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    usage_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    valid_from: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    valid_until: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    redemptions: Mapped[list["CouponRedemption"]] = relationship(back_populates="coupon")


class CouponRedemption(Base, UUIDMixin):
    __tablename__ = "coupon_redemptions"

    coupon_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("coupons.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    coupon: Mapped["Coupon"] = relationship(back_populates="redemptions")


class Offer(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "offers"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    valid_from: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    valid_until: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    coupon_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("coupons.id"), nullable=True)


class CampaignType(str, enum.Enum):
    whatsapp = "whatsapp"
    push = "push"
    coupon = "coupon"
    birthday = "birthday"
    anniversary = "anniversary"
    referral = "referral"
    review = "review"


class CampaignStatus(str, enum.Enum):
    draft = "draft"
    scheduled = "scheduled"
    sending = "sending"
    sent = "sent"
    failed = "failed"


class Campaign(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "campaigns"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[CampaignType] = mapped_column(SAEnum(CampaignType), nullable=False)
    audience_type: Mapped[str] = mapped_column(String(20), nullable=False, default="all")
    segment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    message_template: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    status: Mapped[CampaignStatus] = mapped_column(SAEnum(CampaignStatus), nullable=False, default=CampaignStatus.draft)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    recipients: Mapped[list["CampaignRecipient"]] = relationship(back_populates="campaign", cascade="all, delete-orphan")


class CampaignRecipient(Base, UUIDMixin):
    __tablename__ = "campaign_recipients"

    campaign_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    sent_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    campaign: Mapped["Campaign"] = relationship(back_populates="recipients")
