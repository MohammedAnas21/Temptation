"""Customer favorites — save/remove/list favorite menu items."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["favorites"])


class FavoriteAdd(BaseModel):
    menu_item_id: uuid.UUID


@router.get("")
async def my_favorites(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(text("""
        SELECT f.id, f.menu_item_id, f.created_at,
               m.name, m.price, m.image_url, m.is_veg,
               m.is_best_seller, m.is_available
        FROM user_favorites f
        JOIN menu_items m ON m.id = f.menu_item_id
        WHERE f.user_id = :user_id AND m.deleted_at IS NULL
        ORDER BY f.created_at DESC
    """), {"user_id": str(user.id)})
    return [dict(r) for r in result.mappings().all()]


@router.post("")
async def add_favorite(
    payload: FavoriteAdd,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        await db.execute(text("""
            INSERT INTO user_favorites (user_id, menu_item_id)
            VALUES (:user_id, :menu_item_id)
            ON CONFLICT DO NOTHING
        """), {"user_id": str(user.id), "menu_item_id": str(payload.menu_item_id)})
        await db.commit()
        return {"message": "Added to favorites"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{menu_item_id}")
async def remove_favorite(
    menu_item_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(text("""
        DELETE FROM user_favorites
        WHERE user_id = :user_id AND menu_item_id = :menu_item_id
    """), {"user_id": str(user.id), "menu_item_id": str(menu_item_id)})
    await db.commit()
    return {"message": "Removed from favorites"}
