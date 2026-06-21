"""Pydantic schemas for menu category updates (fixes mass assignment vulnerability)."""
import uuid
from typing import Optional
from pydantic import BaseModel, Field


class CategoryUpdate(BaseModel):
    """Whitelist of fields that can be updated on a menu category."""
    name: Optional[str] = Field(None, max_length=100)
    slug: Optional[str] = Field(None, max_length=120)
    display_order: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None
    branch_id: Optional[uuid.UUID] = None
