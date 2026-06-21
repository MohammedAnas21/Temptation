import uuid
from typing import Optional
from sqlalchemy import String, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin
import enum


class TableType(str, enum.Enum):
    standard = "standard"
    dining = "dining"
    premium_sofa = "premium_sofa"
    private_sofa = "private_sofa"


class TableStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    occupied = "occupied"
    cleaning = "cleaning"
    out_of_service = "out_of_service"


class CafeTable(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "cafe_tables"

    branch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=False, index=True)
    table_number: Mapped[int] = mapped_column(Integer, nullable=False)
    table_type: Mapped[TableType] = mapped_column(SAEnum(TableType), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[TableStatus] = mapped_column(SAEnum(TableStatus), nullable=False, default=TableStatus.available)
    position_x: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    position_y: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="table")
