import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import Integer, Numeric, String, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin
import enum


class LoyaltyTierName(str, enum.Enum):
    bronze = "bronze"
    silver = "silver"
    gold = "gold"


class LoyaltyTransactionType(str, enum.Enum):
    earn = "earn"
    redeem = "redeem"
    referral = "referral"
    birthday = "birthday"
    anniversary = "anniversary"
    manual = "manual"
    reservation_checkin = "reservation_checkin"


class LoyaltyTier(Base, UUIDMixin):
    __tablename__ = "loyalty_tiers"

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    min_points: Mapped[int] = mapped_column(Integer, nullable=False)
    max_points: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    earn_multiplier: Mapped[float] = mapped_column(Numeric(3, 2), default=1.0, nullable=False)
    benefits: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)


class LoyaltyAccount(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "loyalty_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    points_balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lifetime_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tier: Mapped[LoyaltyTierName] = mapped_column(SAEnum(LoyaltyTierName), default=LoyaltyTierName.bronze, nullable=False)

    user: Mapped["User"] = relationship(back_populates="loyalty_account")
    transactions: Mapped[list["LoyaltyTransaction"]] = relationship(back_populates="account")


class LoyaltyTransaction(Base, UUIDMixin):
    __tablename__ = "loyalty_transactions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[LoyaltyTransactionType] = mapped_column(SAEnum(LoyaltyTransactionType), nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)  # positive=earn, negative=redeem
    reference_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    account: Mapped["LoyaltyAccount"] = relationship(back_populates="transactions", foreign_keys="[LoyaltyTransaction.user_id]", primaryjoin="LoyaltyTransaction.user_id == LoyaltyAccount.user_id")


class Referral(Base, UUIDMixin):
    __tablename__ = "referrals"

    referrer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    referred_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False)
