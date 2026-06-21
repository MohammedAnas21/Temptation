import uuid
from typing import Optional
from sqlalchemy import String, Text, Numeric, Boolean, Integer, ForeignKey, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin
from datetime import datetime


class MenuCategory(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "menu_categories"

    branch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    items: Mapped[list["MenuItem"]] = relationship(back_populates="category")


class MenuItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "menu_items"

    branch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=False, index=True)
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("menu_categories.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_veg: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    ingredients: Mapped[Optional[list]] = mapped_column(ARRAY(String), nullable=True)
    preparation_time: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_best_seller: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_recommended: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_chef_special: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    addons: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    category: Mapped["MenuCategory"] = relationship(back_populates="items")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="menu_item")
