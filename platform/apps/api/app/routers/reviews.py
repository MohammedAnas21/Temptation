"""Reviews router — CRUD for customer reviews."""
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from pydantic import BaseModel, Field
from app.database import get_db
from app.models.audit import Review
from app.models.user import User
from app.middleware.auth import get_current_user, require_staff, require_admin

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    branch_id: uuid.UUID
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)
    order_id: Optional[uuid.UUID] = None
    reservation_id: Optional[uuid.UUID] = None
    is_google_review: bool = False


@router.get("")
async def list_reviews(
    branch_id: uuid.UUID,
    min_rating: Optional[int] = Query(None, ge=1, le=5),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List reviews for a branch (public)."""
    filters = [Review.branch_id == branch_id]
    if min_rating is not None:
        filters.append(Review.rating >= min_rating)

    # Count total
    count_q = select(func.count()).select_from(Review).where(and_(*filters))
    total = (await db.execute(count_q)).scalar() or 0

    # Fetch page
    result = await db.execute(
        select(Review).where(and_(*filters))
        .order_by(Review.created_at.desc())
        .offset(skip).limit(limit)
    )
    reviews = result.scalars().all()

    # Average rating
    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(Review.branch_id == branch_id)
    )
    avg_rating = float(avg_result.scalar() or 0)

    return {
        "reviews": [_review_dict(r) for r in reviews],
        "total": total,
        "average_rating": round(avg_rating, 1),
    }


@router.post("")
async def create_review(
    payload: ReviewCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a review (authenticated customers only)."""
    # Prevent duplicate reviews for the same order
    if payload.order_id:
        existing = await db.execute(
            select(Review).where(Review.user_id == user.id, Review.order_id == payload.order_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="You already reviewed this order")

    review = Review(
        user_id=user.id,
        branch_id=payload.branch_id,
        rating=payload.rating,
        comment=payload.comment,
        order_id=payload.order_id,
        reservation_id=payload.reservation_id,
        is_google_review=payload.is_google_review,
        created_at=datetime.now(timezone.utc),
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return _review_dict(review)


@router.get("/my")
async def my_reviews(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
):
    """List current user's reviews."""
    result = await db.execute(
        select(Review).where(Review.user_id == user.id)
        .order_by(Review.created_at.desc())
        .offset(skip).limit(limit)
    )
    reviews = result.scalars().all()
    return [_review_dict(r) for r in reviews]


@router.delete("/{review_id}")
async def delete_review(
    review_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete own review (customers) or any review (admin)."""
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != user.id and user.role.value not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    await db.delete(review)
    await db.commit()
    return {"message": "Review deleted"}


def _review_dict(r: Review) -> dict:
    return {
        "id": str(r.id),
        "user_id": str(r.user_id),
        "branch_id": str(r.branch_id),
        "rating": r.rating,
        "comment": r.comment,
        "order_id": str(r.order_id) if r.order_id else None,
        "reservation_id": str(r.reservation_id) if r.reservation_id else None,
        "is_google_review": r.is_google_review,
        "created_at": r.created_at.isoformat(),
    }
