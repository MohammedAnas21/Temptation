import uuid
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field
from app.middleware.audit import log_audit
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus, OrderStatusHistory, OrderType, PaymentMethod, PaymentStatus
from app.models.menu import MenuItem
from app.models.user import User
from app.middleware.auth import get_current_user, require_staff
from app.services.coupon import validate_coupon, apply_coupon
from app.services.loyalty import redeem_points, earn_from_order, refund_points
from app.services.automation import on_order_delivered
from app.config import get_settings

router = APIRouter(prefix="/orders", tags=["orders"])
settings = get_settings()


class CartItem(BaseModel):
    menu_item_id: uuid.UUID
    quantity: int = Field(..., ge=1, le=50)
    addons: Optional[dict] = None
    notes: Optional[str] = Field(None, max_length=200)


class OrderCreate(BaseModel):
    branch_id: uuid.UUID
    order_type: OrderType
    items: List[CartItem] = Field(..., min_length=1, max_length=30)
    table_id: Optional[uuid.UUID] = None
    coupon_code: Optional[str] = Field(None, max_length=20)
    points_to_redeem: int = Field(0, ge=0)
    payment_method: PaymentMethod
    notes: Optional[str] = Field(None, max_length=500)


@router.post("")
async def place_order(
    payload: OrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    item_rows = []
    subtotal = 0.0
    for cart_item in payload.items:
        result = await db.execute(
            select(MenuItem).where(
                MenuItem.id == cart_item.menu_item_id,
                MenuItem.is_available == True,
                MenuItem.branch_id == payload.branch_id,
            )
        )
        mi = result.scalar_one_or_none()
        if not mi:
            raise HTTPException(status_code=400, detail=f"Item {cart_item.menu_item_id} not found or unavailable")
        line_total = float(mi.price) * cart_item.quantity
        subtotal += line_total
        item_rows.append((cart_item, mi, float(mi.price)))

    discount = 0.0
    coupon_id = None
    if payload.coupon_code:
        coupon_data = await validate_coupon(db, payload.coupon_code, user.id, subtotal)
        discount += coupon_data["discount"]
        coupon_id = coupon_data["coupon_id"]

    # Compute redemption cap before creating the order
    actual_points = 0
    points_discount = 0.0
    if payload.points_to_redeem > 0:
        max_discount = subtotal * settings.max_redemption_pct
        potential_discount = payload.points_to_redeem * settings.points_redemption_rate
        if potential_discount > max_discount:
            capped_points = int(max_discount / settings.points_redemption_rate)
            actual_points = max(capped_points - (capped_points % settings.min_redemption_points), 0)
        else:
            actual_points = payload.points_to_redeem
        if actual_points >= settings.min_redemption_points:
            points_discount = actual_points * settings.points_redemption_rate
        else:
            actual_points = 0

    discount += points_discount
    total = max(0.0, subtotal - discount)

    order = Order(
        branch_id=payload.branch_id,
        customer_id=user.id,
        table_id=payload.table_id,
        order_type=payload.order_type,
        status=OrderStatus.pending,
        subtotal=subtotal,
        discount_amount=discount,
        points_redeemed=0,
        total_amount=total,
        payment_method=payload.payment_method,
        payment_status=PaymentStatus.pending if payload.payment_method != PaymentMethod.cash else PaymentStatus.paid,
        coupon_id=coupon_id,
        notes=payload.notes,
    )
    db.add(order)
    await db.flush()

    if actual_points > 0:
        try:
            await redeem_points(db, user.id, actual_points, order.id)
            order.points_redeemed = actual_points
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    for cart_item, mi, price in item_rows:
        oi = OrderItem(
            order_id=order.id,
            menu_item_id=mi.id,
            quantity=cart_item.quantity,
            unit_price=price,
            addons=cart_item.addons,
            notes=cart_item.notes,
        )
        db.add(oi)

    if coupon_id:
        await apply_coupon(db, coupon_id, user.id, order.id, discount)

    history = OrderStatusHistory(
        order_id=order.id, status=OrderStatus.pending,
        changed_by=user.id, created_at=datetime.now(timezone.utc),
    )
    db.add(history)

    if payload.payment_method == PaymentMethod.cash:
        order.status = OrderStatus.confirmed

    await log_audit(db, "order_placed", "order", order.id, user.id,
                    None, {"total": float(total), "items": len(payload.items)})
    await db.commit()
    await db.refresh(order)
    return _order_dict(order)


@router.get("/my")
async def my_orders(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.customer_id == user.id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return [_order_dict(o) for o in result.scalars().all()]


@router.get("/{order_id}")
async def get_order(
    order_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role.value == "customer" and o.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return _order_dict(o)


@router.patch("/{order_id}/status", dependencies=[Depends(require_staff)])
async def update_order_status(
    order_id: uuid.UUID,
    status: OrderStatus,
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")

    o.status = status
    history = OrderStatusHistory(
        order_id=o.id, status=status,
        changed_by=user.id, created_at=datetime.now(timezone.utc),
    )
    db.add(history)

    if status == OrderStatus.delivered:
        u_result = await db.execute(select(User).where(User.id == o.customer_id))
        customer = u_result.scalar_one_or_none()
        if customer:
            await on_order_delivered(db, o, customer)

    await db.commit()
    return _order_dict(o)


@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role.value == "customer" and o.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if o.status not in (OrderStatus.pending, OrderStatus.confirmed):
        raise HTTPException(status_code=400, detail=f"Cannot cancel order with status: {o.status.value}")

    o.status = OrderStatus.cancelled
    history = OrderStatusHistory(
        order_id=o.id, status=OrderStatus.cancelled,
        changed_by=user.id, created_at=datetime.now(timezone.utc),
    )
    db.add(history)

    if o.points_redeemed > 0:
        await refund_points(
            db, o.customer_id, o.points_redeemed, o.id,
            f"Refund for cancelled order #{str(o.id)[:8]}",
        )

    await db.commit()
    return {"id": str(o.id), "status": "cancelled"}


@router.get("", dependencies=[Depends(require_staff)])
async def list_orders(
    branch_id: Optional[uuid.UUID] = None,
    status: Optional[OrderStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = []
    if branch_id:
        filters.append(Order.branch_id == branch_id)
    if status:
        filters.append(Order.status == status)
    q = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    if filters:
        q = q.where(and_(*filters))
    result = await db.execute(q)
    return [_order_dict(o) for o in result.scalars().all()]


def _order_dict(o: Order) -> dict:
    items = []
    if hasattr(o, "items") and o.items:
        items = [
            {
                "menu_item_id": str(oi.menu_item_id),
                "quantity": oi.quantity,
                "unit_price": float(oi.unit_price),
                "line_total": float(oi.unit_price * oi.quantity),
                "addons": oi.addons,
                "notes": oi.notes,
            }
            for oi in o.items
        ]
    return {
        "id": str(o.id),
        "customer_id": str(o.customer_id),
        "order_type": o.order_type.value,
        "status": o.status.value,
        "subtotal": float(o.subtotal),
        "discount_amount": float(o.discount_amount),
        "points_redeemed": o.points_redeemed,
        "total_amount": float(o.total_amount),
        "payment_method": o.payment_method.value if o.payment_method else None,
        "payment_status": o.payment_status.value,
        "notes": o.notes,
        "items": items,
        "created_at": o.created_at.isoformat(),
    }
