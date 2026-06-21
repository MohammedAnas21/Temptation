"""Pydantic schemas for table updates (fixes mass assignment vulnerability)."""
from typing import Optional
from pydantic import BaseModel, Field
from app.models.table import TableStatus, TableType


class TableUpdate(BaseModel):
    """Whitelist of fields that can be updated on a cafe table."""
    table_number: Optional[str] = Field(None, max_length=20)
    table_type: Optional[TableType] = None
    capacity: Optional[int] = Field(None, ge=1, le=50)
    status: Optional[TableStatus] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
