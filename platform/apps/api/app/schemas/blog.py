"""Pydantic schemas for blog post updates (fixes mass assignment vulnerability)."""
import uuid
from typing import Optional
from pydantic import BaseModel, Field


class PostUpdate(BaseModel):
    """Whitelist of fields that can be updated on a blog post."""
    title: Optional[str] = Field(None, max_length=300)
    slug: Optional[str] = Field(None, max_length=320)
    excerpt: Optional[str] = Field(None, max_length=1000)
    content: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    tags: Optional[list[str]] = None
    is_published: Optional[bool] = None
    featured_image_url: Optional[str] = Field(None, max_length=500)
