import uuid
import string
import random
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User, UserRole
from app.middleware.auth import get_current_user
from app.integrations.firebase import verify_firebase_token
from app.integrations.supabase import upload_file
import logging

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


def _gen_referral_code(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


class VerifyTokenRequest(BaseModel):
    id_token: str
    fcm_token: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    birthday: Optional[str] = None   # YYYY-MM-DD
    anniversary: Optional[str] = None
    fcm_token: Optional[str] = None


@router.post("/verify")
async def verify_token(payload: VerifyTokenRequest, db: AsyncSession = Depends(get_db)):
    """Verify Firebase token, upsert user in DB, return user profile."""
    decoded = await verify_firebase_token(payload.id_token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    firebase_uid = decoded.get("uid")
    phone = decoded.get("phone_number")
    email = decoded.get("email")
    name = decoded.get("name")

    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        referral_code = _gen_referral_code()
        # Ensure referral code is unique
        while True:
            exists = await db.execute(select(User).where(User.referral_code == referral_code))
            if not exists.scalar_one_or_none():
                break
            referral_code = _gen_referral_code()

        user = User(
            firebase_uid=firebase_uid,
            phone=phone,
            email=email,
            name=name,
            role=UserRole.customer,
            referral_code=referral_code,
            fcm_token=payload.fcm_token,
        )
        db.add(user)
    else:
        # Update FCM token if provided
        if payload.fcm_token:
            user.fcm_token = payload.fcm_token
        if not user.name and name:
            user.name = name

    await db.commit()
    await db.refresh(user)
    return {
        "id": str(user.id),
        "firebase_uid": user.firebase_uid,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "role": user.role.value,
        "referral_code": user.referral_code,
        "avatar_url": user.avatar_url,
    }


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "role": user.role.value,
        "referral_code": user.referral_code,
        "birthday": str(user.birthday) if user.birthday else None,
        "anniversary": str(user.anniversary) if user.anniversary else None,
        "avatar_url": user.avatar_url,
    }


@router.patch("/me")
async def update_profile(
    payload: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        user.email = payload.email
    if payload.birthday is not None:
        from datetime import date
        user.birthday = date.fromisoformat(payload.birthday)
    if payload.anniversary is not None:
        from datetime import date
        user.anniversary = date.fromisoformat(payload.anniversary)
    if payload.fcm_token is not None:
        user.fcm_token = payload.fcm_token

    await db.commit()
    await db.refresh(user)
    return {"message": "Profile updated", "id": str(user.id)}


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")
    url = await upload_file(content, file.filename or "avatar.jpg", folder="avatars")
    if not url:
        raise HTTPException(status_code=500, detail="Upload failed")
    user.avatar_url = url
    await db.commit()
    return {"avatar_url": url}
