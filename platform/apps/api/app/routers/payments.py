import uuid
import base64
import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from app.database import get_db
from app.models.payment import Payment, PaymentEvent, PaymentMethod, PaymentStatus, PaymentReferenceType
from app.models.order import Order, PaymentStatus as OrderPaymentStatus, OrderStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.user import User
from app.middleware.auth import get_current_user, require_admin
from app.integrations.phonepe import initiate_payment, verify_webhook_checksum, check_payment_status
from app.config import get_settings
from app.services.automation import on_payment_success, on_reservation_confirmed
from app.middleware.audit import log_audit

router = APIRouter(prefix="/payments", tags=["payments"])
settings = get_settings()


class InitiatePaymentRequest(BaseModel):
    amount: float = Field(..., gt=0)
    reference_type: PaymentReferenceType
    reference_id: uuid.UUID
    redirect_url: HttpUrl
    callback_url: HttpUrl


@router.post("/initiate")
async def initiate(
    payload: InitiatePaymentRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    existing_payment = await db.execute(
        select(Payment).where(
            Payment.user_id == user.id,
            Payment.reference_type == payload.reference_type,
            Payment.reference_id == payload.reference_id,
            Payment.status.in_([PaymentStatus.pending, PaymentStatus.success]),
        )
    )
    existing = existing_payment.scalar_one_or_none()
    if existing:
        return {
            "payment_id": str(existing.id),
            "merchant_txn_id": existing.gateway_txn_id,
            "status": existing.status.value,
        }

    # Resolve branch from the linked order/reservation, not the user's profile
    branch_id_to_use = user.branch_id
    if payload.reference_type == PaymentReferenceType.order:
        order_res = await db.execute(select(Order).where(Order.id == payload.reference_id))
        order_ref = order_res.scalar_one_or_none()
        if not order_ref:
            raise HTTPException(status_code=404, detail="Order not found")
        if order_ref.customer_id != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        branch_id_to_use = order_ref.branch_id
        if abs(float(order_ref.total_amount) - payload.amount) > 0.01:
            raise HTTPException(status_code=400, detail="Payment amount does not match order total")
    elif payload.reference_type == PaymentReferenceType.reservation:
        res_res = await db.execute(select(Reservation).where(Reservation.id == payload.reference_id))
        res_ref = res_res.scalar_one_or_none()
        if not res_ref:
            raise HTTPException(status_code=404, detail="Reservation not found")
        if res_ref.customer_id != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        branch_id_to_use = res_ref.branch_id
        if abs(float(res_ref.deposit_amount) - payload.amount) > 0.01:
            raise HTTPException(status_code=400, detail="Payment amount does not match deposit")
    elif not branch_id_to_use:
        from app.models.branch import Branch
        from sqlalchemy import select as _select
        br = await db.execute(_select(Branch).where(Branch.is_active == True).limit(1))
        first_branch = br.scalar_one_or_none()
        if not first_branch:
            raise HTTPException(status_code=500, detail="No active branch configured")
        branch_id_to_use = first_branch.id

    payment = Payment(
        branch_id=branch_id_to_use,
        user_id=user.id,
        reference_type=payload.reference_type,
        reference_id=payload.reference_id,
        amount=payload.amount,
        method=PaymentMethod.phonepe,
        status=PaymentStatus.pending,
        idempotency_key=f"{user.id}:{payload.reference_id}",
    )
    db.add(payment)
    await db.flush()

    merchant_txn_id = f"TC{str(payment.id).replace('-', '')[:20]}"
    payment.gateway_txn_id = merchant_txn_id

    result = await initiate_payment(
        amount_paise=int(payload.amount * 100),
        merchant_txn_id=merchant_txn_id,
        user_id=str(user.id),
        redirect_url=str(payload.redirect_url),
        callback_url=str(payload.callback_url),
        mobile=user.phone,
    )

    if not result["success"]:
        payment.status = PaymentStatus.failed
        await db.commit()
        raise HTTPException(status_code=502, detail=result.get("error", "Payment gateway error"))

    await log_audit(
        db,
        "payment_initiated",
        "payment",
        payment.id,
        user.id,
        None,
        {"reference_type": payload.reference_type.value, "reference_id": str(payload.reference_id), "amount": payload.amount},
    )
    await db.commit()
    return {
        "payment_id": str(payment.id),
        "redirect_url": result["redirect_url"],
        "merchant_txn_id": merchant_txn_id,
    }


@router.post("/webhooks/phonepe")
async def phonepe_webhook(
    request: Request,
    x_verify: str = Header(None, alias="X-VERIFY"),
    db: AsyncSession = Depends(get_db),
):
    """PhonePe payment webhook — HMAC verified."""
    body = await request.body()
    try:
        data = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    response_b64 = data.get("response", "")
    if not verify_webhook_checksum(x_verify or "", response_b64):
        raise HTTPException(status_code=403, detail="Invalid webhook signature")

    event_hash = hashlib.sha256(f"{x_verify or ''}:{response_b64}".encode()).hexdigest()
    existing_event = await db.execute(select(PaymentEvent).where(PaymentEvent.event_hash == event_hash))
    if existing_event.scalar_one_or_none():
        return {"status": "duplicate"}

    try:
        decoded = json.loads(base64.b64decode(response_b64).decode())
    except Exception:
        raise HTTPException(status_code=400, detail="Cannot decode response")

    merchant_txn_id = decoded.get("data", {}).get("merchantTransactionId")
    pg_status = decoded.get("code", "")

    result = await db.execute(select(Payment).where(Payment.gateway_txn_id == merchant_txn_id))
    payment = result.scalar_one_or_none()
    if not payment:
        return {"status": "ignored"}  # Unknown txn — acknowledge anyway

    # Idempotency: already processed
    if payment.status in (PaymentStatus.success, PaymentStatus.refunded):
        return {"status": "already_processed"}

    event = PaymentEvent(
        payment_id=payment.id,
        event_type=pg_status,
        event_hash=event_hash,
        payload=decoded,
        created_at=datetime.now(timezone.utc),
    )
    db.add(event)

    if pg_status == "PAYMENT_SUCCESS":
        payment.status = PaymentStatus.success
        payment.gateway_response = decoded

        u_res = await db.execute(select(User).where(User.id == payment.user_id))
        payer = u_res.scalar_one_or_none()

        if payment.reference_type == PaymentReferenceType.order:
            r = await db.execute(select(Order).where(Order.id == payment.reference_id))
            order = r.scalar_one_or_none()
            if order:
                order.payment_status = OrderPaymentStatus.paid
                order.status = OrderStatus.confirmed

        elif payment.reference_type == PaymentReferenceType.reservation:
            r = await db.execute(select(Reservation).where(Reservation.id == payment.reference_id))
            res = r.scalar_one_or_none()
            if res:
                res.deposit_paid = True
                res.status = ReservationStatus.confirmed
                res.payment_id = payment.id
                if payer:
                    await on_reservation_confirmed(db, res, payer)

        if payer:
            await on_payment_success(db, payment, payer)
            await log_audit(
                db,
                "payment_success",
                "payment",
                payment.id,
                payer.id,
                {"status": "pending"},
                {"status": "success", "gateway_txn_id": merchant_txn_id},
            )

    elif pg_status in ("PAYMENT_ERROR", "PAYMENT_CANCELLED", "TIMED_OUT"):
        payment.status = PaymentStatus.failed
        await log_audit(
            db,
            "payment_failed",
            "payment",
            payment.id,
            payment.user_id,
            {"status": "pending"},
            {"status": "failed", "gateway_status": pg_status},
        )

    await db.commit()
    return {"status": "ok"}


@router.get("/{payment_id}")
async def get_payment(
    payment_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    if user.role.value == "customer" and p.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return {"id": str(p.id), "amount": float(p.amount), "status": p.status.value, "method": p.method.value}


@router.get("/{payment_id}/status")
async def get_payment_status(
    payment_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await poll_payment_status(payment_id, user, db)


@router.post("/{payment_id}/poll")
async def poll_payment_status(
    payment_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    if user.role.value == "customer" and p.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if not p.gateway_txn_id:
        raise HTTPException(status_code=400, detail="No gateway transaction ID")

    status_response = await check_payment_status(p.gateway_txn_id)
    event = PaymentEvent(
        payment_id=p.id,
        event_type="STATUS_POLL",
        payload=status_response,
        created_at=datetime.now(timezone.utc),
    )
    db.add(event)

    code = status_response.get("code")
    if code == "PAYMENT_SUCCESS" and p.status == PaymentStatus.pending:
        old_status = p.status.value
        p.status = PaymentStatus.success
        p.gateway_response = status_response
        payer_result = await db.execute(select(User).where(User.id == p.user_id))
        payer = payer_result.scalar_one_or_none()
        if p.reference_type == PaymentReferenceType.order:
            order_result = await db.execute(select(Order).where(Order.id == p.reference_id))
            order = order_result.scalar_one_or_none()
            if order:
                order.payment_status = OrderPaymentStatus.paid
                order.status = OrderStatus.confirmed
        elif p.reference_type == PaymentReferenceType.reservation:
            reservation_result = await db.execute(select(Reservation).where(Reservation.id == p.reference_id))
            reservation = reservation_result.scalar_one_or_none()
            if reservation:
                reservation.deposit_paid = True
                reservation.status = ReservationStatus.confirmed
                reservation.payment_id = p.id
                if payer:
                    await on_reservation_confirmed(db, reservation, payer)
        if payer:
            await on_payment_success(db, p, payer)
        await log_audit(db, "payment_polled_success", "payment", p.id, user.id, {"status": old_status}, {"status": p.status.value})
    elif code in ("PAYMENT_ERROR", "PAYMENT_CANCELLED", "TIMED_OUT") and p.status == PaymentStatus.pending:
        old_status = p.status.value
        p.status = PaymentStatus.failed
        p.gateway_response = status_response
        await log_audit(db, "payment_polled_failed", "payment", p.id, user.id, {"status": old_status}, {"status": p.status.value, "gateway_status": code})

    await db.commit()
    return {"payment_id": str(p.id), "status": p.status.value, "gateway_status": code, "gateway_response": status_response}


@router.get("", dependencies=[Depends(require_admin)])
async def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payment).order_by(Payment.created_at.desc()).offset(skip).limit(limit))
    payments = result.scalars().all()
    return [{"id": str(p.id), "amount": float(p.amount), "status": p.status.value, "created_at": p.created_at.isoformat()} for p in payments]


class RefundRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)


@router.post("/{payment_id}/refund", dependencies=[Depends(require_admin)])
async def refund_payment(
    payment_id: uuid.UUID,
    payload: RefundRequest,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Initiate a refund via PhonePe refund API."""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    if p.status != PaymentStatus.success:
        raise HTTPException(status_code=400, detail=f"Cannot refund payment with status: {p.status.value}")
    if not p.gateway_txn_id:
        raise HTTPException(status_code=400, detail="No gateway transaction ID — cannot refund")

    # Call PhonePe refund API
    refund_result = await _initiate_phonepe_refund(
        original_txn_id=p.gateway_txn_id,
        refund_amount_paise=int(float(p.amount) * 100),
        refund_txn_id=f"RFD{str(p.id).replace('-','')[:18]}",
    )

    if not refund_result.get("success"):
        raise HTTPException(status_code=502, detail=refund_result.get("error", "Refund failed"))

    p.status = PaymentStatus.refunded
    # Log refund event
    event = PaymentEvent(
        payment_id=p.id,
        event_type="REFUND_INITIATED",
        payload={"reason": payload.reason, "refund_txn_id": refund_result.get("refund_txn_id")},
        created_at=datetime.now(timezone.utc),
    )
    db.add(event)
    await log_audit(
        db,
        "payment_refund_initiated",
        "payment",
        p.id,
        user.id,
        {"status": "success"},
        {"status": "refunded", "reason": payload.reason},
    )

    # Update linked order/reservation payment status
    if p.reference_type == PaymentReferenceType.order:
        r = await db.execute(select(Order).where(Order.id == p.reference_id))
        order = r.scalar_one_or_none()
        if order:
            order.payment_status = OrderPaymentStatus.refunded

    await db.commit()
    return {"payment_id": str(p.id), "status": "refunded", "refund_txn_id": refund_result.get("refund_txn_id")}


@router.get("/settlements", dependencies=[Depends(require_admin)])
async def get_settlements(
    branch_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Daily settlement reports (admin only)."""
    from app.services.settlements import get_settlement_report
    from datetime import date as date_type
    sd = date_type.fromisoformat(start_date) if start_date else None
    ed = date_type.fromisoformat(end_date) if end_date else None
    return await get_settlement_report(db, branch_id=branch_id, start_date=sd, end_date=ed, skip=skip, limit=limit)


@router.get("/audit-trail", dependencies=[Depends(require_admin)])
async def get_payment_audit(
    payment_id: Optional[str] = None,
    user_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Payment event audit trail (admin only)."""
    from app.services.settlements import get_payment_audit_trail
    return await get_payment_audit_trail(db, payment_id=payment_id, user_id=user_id, skip=skip, limit=limit)


async def _initiate_phonepe_refund(
    original_txn_id: str,
    refund_amount_paise: int,
    refund_txn_id: str,
) -> dict:
    """Call PhonePe refund API."""
    import hashlib, base64, json, httpx
    from app.config import get_settings
    s = get_settings()

    payload = {
        "merchantId": s.phonepe_merchant_id,
        "merchantTransactionId": refund_txn_id,
        "originalTransactionId": original_txn_id,
        "amount": refund_amount_paise,
        "callbackUrl": "",
    }
    payload_json = json.dumps(payload)
    payload_b64 = base64.b64encode(payload_json.encode()).decode()
    endpoint = "/pg/v1/refund"
    data = payload_b64 + endpoint + s.phonepe_salt_key
    sha256 = hashlib.sha256(data.encode()).hexdigest()
    checksum = f"{sha256}###{s.phonepe_salt_index}"

    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": s.phonepe_merchant_id,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(f"{s.phonepe_base_url}{endpoint}", json={"request": payload_b64}, headers=headers)
            data = resp.json()
            if data.get("success"):
                return {"success": True, "refund_txn_id": refund_txn_id}
            return {"success": False, "error": data.get("message", "PhonePe refund error")}
    except Exception as e:
        return {"success": False, "error": str(e)}
