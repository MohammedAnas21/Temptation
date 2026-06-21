import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.database import get_db
from app.models.blog import BlogPost, BlogCategory
from app.middleware.auth import require_admin
from app.schemas.blog import PostUpdate

router = APIRouter(prefix="/blog", tags=["blog"])


class PostCreate(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    tags: Optional[list[str]] = None
    is_published: bool = False


@router.get("/posts")
async def list_posts(
    category_slug: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    filters = [BlogPost.is_published == True, BlogPost.deleted_at == None]
    if category_slug:
        cat_result = await db.execute(select(BlogCategory).where(BlogCategory.slug == category_slug))
        cat = cat_result.scalar_one_or_none()
        if cat:
            filters.append(BlogPost.category_id == cat.id)

    result = await db.execute(
        select(BlogPost).where(and_(*filters))
        .order_by(BlogPost.published_at.desc())
        .offset(skip).limit(limit)
    )
    posts = result.scalars().all()
    return [_post_summary(p) for p in posts]


@router.get("/posts/{slug}")
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BlogPost).where(BlogPost.slug == slug, BlogPost.is_published == True, BlogPost.deleted_at == None)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {**_post_summary(post), "content": post.content}


@router.post("/posts", dependencies=[Depends(require_admin)])
async def create_post(payload: PostCreate, db: AsyncSession = Depends(get_db)):
    post = BlogPost(**payload.model_dump())
    if payload.is_published:
        post.published_at = datetime.now(timezone.utc)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return _post_summary(post)


@router.put("/posts/{post_id}", dependencies=[Depends(require_admin)])
async def update_post(post_id: uuid.UUID, payload: PostUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    update_data = payload.model_dump(exclude_none=True)
    for k, v in update_data.items():
        setattr(post, k, v)
    if update_data.get("is_published") and not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    await db.commit()
    return _post_summary(post)


@router.delete("/posts/{post_id}", dependencies=[Depends(require_admin)])
async def delete_post(post_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Deleted"}


def _post_summary(p: BlogPost) -> dict:
    return {
        "id": str(p.id),
        "title": p.title,
        "slug": p.slug,
        "excerpt": p.excerpt,
        "featured_image_url": p.featured_image_url,
        "tags": p.tags or [],
        "is_published": p.is_published,
        "published_at": p.published_at.isoformat() if p.published_at else None,
    }
