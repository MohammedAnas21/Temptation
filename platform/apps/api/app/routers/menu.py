import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.database import get_db
from app.models.menu import MenuCategory, MenuItem
from app.models.user import User
from app.middleware.auth import get_current_user, require_admin
from app.schemas.menu import CategoryUpdate

router = APIRouter(prefix="/menu", tags=["menu"])


class CategoryCreate(BaseModel):
    name: str
    slug: str
    display_order: int = 0
    branch_id: uuid.UUID


class ItemCreate(BaseModel):
    category_id: uuid.UUID
    branch_id: uuid.UUID
    name: str
    description: Optional[str] = None
    price: float
    is_veg: bool = True
    ingredients: Optional[List[str]] = None
    preparation_time: int = 15
    is_available: bool = True
    is_best_seller: bool = False
    is_recommended: bool = False
    is_chef_special: bool = False
    sort_order: int = 0


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_veg: Optional[bool] = None
    ingredients: Optional[List[str]] = None
    preparation_time: Optional[int] = None
    is_available: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    is_recommended: Optional[bool] = None
    is_chef_special: Optional[bool] = None
    sort_order: Optional[int] = None


@router.get("/categories")
async def list_categories(branch_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MenuCategory)
        .where(and_(MenuCategory.branch_id == branch_id, MenuCategory.is_active == True))
        .order_by(MenuCategory.display_order)
    )
    cats = result.scalars().all()
    return [{"id": str(c.id), "name": c.name, "slug": c.slug, "image_url": c.image_url, "display_order": c.display_order} for c in cats]


@router.get("/items")
async def list_items(
    branch_id: uuid.UUID,
    category_id: Optional[uuid.UUID] = None,
    is_veg: Optional[bool] = None,
    tag: Optional[str] = Query(None, description="best_seller|recommended|chef_special"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    filters = [MenuItem.branch_id == branch_id, MenuItem.is_available == True, MenuItem.deleted_at == None]
    if category_id:
        filters.append(MenuItem.category_id == category_id)
    if is_veg is not None:
        filters.append(MenuItem.is_veg == is_veg)
    if tag == "best_seller":
        filters.append(MenuItem.is_best_seller == True)
    elif tag == "recommended":
        filters.append(MenuItem.is_recommended == True)
    elif tag == "chef_special":
        filters.append(MenuItem.is_chef_special == True)

    result = await db.execute(select(MenuItem).where(and_(*filters)).order_by(MenuItem.sort_order))
    items = result.scalars().all()

    if search:
        q = search.lower()
        items = [i for i in items if q in (i.name or "").lower() or q in (i.description or "").lower()]

    return [_item_dict(i) for i in items]


@router.get("/items/{item_id}")
async def get_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id, MenuItem.deleted_at == None))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return _item_dict(item)


@router.post("/categories", dependencies=[Depends(require_admin)])
async def create_category(payload: CategoryCreate, db: AsyncSession = Depends(get_db)):
    cat = MenuCategory(**payload.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {"id": str(cat.id), "name": cat.name}


@router.put("/categories/{cat_id}", dependencies=[Depends(require_admin)])
async def update_category(cat_id: uuid.UUID, payload: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MenuCategory).where(MenuCategory.id == cat_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(cat, k, v)
    await db.commit()
    return {"message": "Updated"}


@router.post("/items", dependencies=[Depends(require_admin)])
async def create_item(payload: ItemCreate, db: AsyncSession = Depends(get_db)):
    item = MenuItem(**payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _item_dict(item)


@router.put("/items/{item_id}", dependencies=[Depends(require_admin)])
async def update_item(item_id: uuid.UUID, payload: ItemUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(item, k, v)
    await db.commit()
    return _item_dict(item)


@router.patch("/items/{item_id}/availability", dependencies=[Depends(require_admin)])
async def toggle_availability(item_id: uuid.UUID, available: bool, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_available = available
    await db.commit()
    return {"id": str(item.id), "is_available": available}


@router.post("/items/{item_id}/image", dependencies=[Depends(require_admin)])
async def upload_item_image(item_id: uuid.UUID, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    from app.integrations.supabase import upload_file
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    content = await file.read()
    url = await upload_file(content, file.filename or "item.jpg", folder="menu")
    if not url:
        raise HTTPException(status_code=500, detail="Upload failed")
    item.image_url = url
    await db.commit()
    return {"image_url": url}


@router.delete("/items/{item_id}", dependencies=[Depends(require_admin)])
async def delete_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    from datetime import datetime, timezone
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Deleted"}


def _item_dict(i: MenuItem) -> dict:
    return {
        "id": str(i.id),
        "category_id": str(i.category_id),
        "name": i.name,
        "description": i.description,
        "price": float(i.price),
        "image_url": i.image_url,
        "is_veg": i.is_veg,
        "ingredients": i.ingredients or [],
        "preparation_time": i.preparation_time,
        "is_available": i.is_available,
        "is_best_seller": i.is_best_seller,
        "is_recommended": i.is_recommended,
        "is_chef_special": i.is_chef_special,
        "sort_order": i.sort_order,
    }
