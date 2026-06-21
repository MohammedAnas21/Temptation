"""Staff management — invite, list, update role, deactivate."""
import uuid
import string
import random
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from app.database import get_db
from app.models.user import User, UserRole
from app.middleware.auth import require_admin, get_current_user
from app.middleware.audit import log_audit

router = APIRouter(prefix="/staff", tags=["staff"])

STAFF_ROLES = [UserRole.staff, UserRole.manager, UserRole.admin]


class StaffInvite(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.staff
    branch_id: Optional[uuid.UUID] = None


class RoleUpdate(BaseModel):
    role: UserRole


@router.get("", dependencies=[Depends(require_admin)])
async def list_staff(
    branch_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(User).where(
        User.role.in_(STAFF_ROLES + [UserRole.admin, UserRole.super_admin]),
        User.deleted_at == None,
    )
    if branch_id:
        q = q.where(User.branch_id == branch_id)
    q = q.order_by(User.created_at.desc())
    result = await db.execute(q)
    users = result.scalars().all()
    return [_staff_dict(u) for u in users]


@router.post("", dependencies=[Depends(require_admin)])
async def invite_staff(
    payload: StaffInvite,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Check if phone already exists
    existing = await db.execute(select(User).where(User.phone == payload.phone))
    user = existing.scalar_one_or_none()

    if user:
        if user.role.value not in [r.value for r in STAFF_ROLES + [UserRole.admin]]:
            # Upgrade existing customer to staff
            old_role = user.role.value
            user.role = payload.role
            user.name = payload.name
            if payload.branch_id:
                user.branch_id = payload.branch_id
            await log_audit(db, "role_upgrade", "user", user.id, current_user.id,
                            {"role": old_role}, {"role": payload.role.value})
            await db.commit()
            return {"message": "Existing user upgraded to staff", **_staff_dict(user)}
        raise HTTPException(status_code=409, detail="Staff with this phone already exists")

    # Create pending staff user (no Firebase UID yet — they'll register via app)
    referral_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    new_user = User(
        firebase_uid=f"pending_{uuid.uuid4().hex[:16]}",  # Temporary until they log in
        phone=payload.phone,
        name=payload.name,
        role=payload.role,
        branch_id=payload.branch_id,
        referral_code=referral_code,
        is_active=True,
    )
    db.add(new_user)
    await db.flush()
    await log_audit(db, "staff_invited", "user", new_user.id, current_user.id,
                    None, {"phone": payload.phone, "role": payload.role.value})
    await db.commit()
    return {"message": "Staff invited", **_staff_dict(new_user)}


@router.patch("/{staff_id}/role", dependencies=[Depends(require_admin)])
async def update_staff_role(
    staff_id: uuid.UUID,
    payload: RoleUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == staff_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Staff not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    old_role = user.role.value
    user.role = payload.role
    await log_audit(db, "role_changed", "user", user.id, current_user.id,
                    {"role": old_role}, {"role": payload.role.value})
    await db.commit()
    return {"id": str(user.id), "role": user.role.value, "message": "Role updated"}


@router.delete("/{staff_id}", dependencies=[Depends(require_admin)])
async def deactivate_staff(
    staff_id: uuid.UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == staff_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Staff not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = False
    user.deleted_at = datetime.now(timezone.utc)
    await log_audit(db, "staff_deactivated", "user", user.id, current_user.id,
                    {"is_active": True}, {"is_active": False})
    await db.commit()
    return {"message": "Staff deactivated"}


def _staff_dict(u: User) -> dict:
    return {
        "id": str(u.id),
        "name": u.name,
        "phone": u.phone,
        "email": u.email,
        "role": u.role.value,
        "branch_id": str(u.branch_id) if u.branch_id else None,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat(),
    }
