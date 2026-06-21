import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.branch import Branch

router = APIRouter(prefix="/branches", tags=["branches"])


@router.get("")
async def list_branches(db: AsyncSession = Depends(get_db)):
    """Public endpoint — returns active branches for client apps."""
    result = await db.execute(
        select(Branch).where(Branch.is_active == True).order_by(Branch.name)
    )
    branches = result.scalars().all()
    return [_branch_dict(b) for b in branches]


@router.get("/{branch_id}")
async def get_branch(branch_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Branch).where(Branch.id == branch_id, Branch.is_active == True)
    )
    branch = result.scalar_one_or_none()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return _branch_dict(branch)


def _branch_dict(b: Branch) -> dict:
    return {
        "id": str(b.id),
        "name": b.name,
        "address": b.address,
        "city": b.city,
        "phone": b.phone,
        "email": b.email,
        "google_maps_url": b.google_maps_url,
        "latitude": b.latitude,
        "longitude": b.longitude,
    }
