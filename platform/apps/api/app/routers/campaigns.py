import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.database import get_db
from app.models.marketing import Campaign, CampaignRecipient, CampaignType, CampaignStatus
from app.models.user import User
from app.middleware.auth import require_manager, get_current_user
from app.integrations.fcm import send_push_multicast
from app.integrations.whatsapp import send_whatsapp_text

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class CampaignCreate(BaseModel):
    name: str
    type: CampaignType
    audience_type: str = "all"
    message_template: Optional[str] = None
    scheduled_at: Optional[datetime] = None


@router.post("", dependencies=[Depends(require_manager)])
async def create_campaign(
    payload: CampaignCreate,
    user: User = Depends(require_manager),
    db: AsyncSession = Depends(get_db),
):
    campaign = Campaign(
        name=payload.name,
        type=payload.type,
        audience_type=payload.audience_type,
        message_template=payload.message_template,
        scheduled_at=payload.scheduled_at,
        status=CampaignStatus.scheduled if payload.scheduled_at else CampaignStatus.draft,
        created_by=user.id,
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return {"id": str(campaign.id), "name": campaign.name, "status": campaign.status.value}


@router.post("/{campaign_id}/send", dependencies=[Depends(require_manager)])
async def send_campaign(campaign_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status == CampaignStatus.sent:
        raise HTTPException(status_code=400, detail="Campaign already sent")

    # Fetch audience
    from sqlalchemy import select as sel
    users_result = await db.execute(sel(User).where(User.is_active == True, User.role == "customer"))
    users = users_result.scalars().all()

    campaign.status = CampaignStatus.sending

    # Create recipient records
    for u in users:
        rec = CampaignRecipient(
            campaign_id=campaign.id,
            user_id=u.id,
            status="pending",
        )
        db.add(rec)
    await db.flush()

    # Send based on type
    sent = 0
    if campaign.type == CampaignType.push:
        tokens = [u.fcm_token for u in users if u.fcm_token]
        if tokens and campaign.message_template:
            sent = await send_push_multicast(tokens, campaign.name, campaign.message_template)

    elif campaign.type == CampaignType.whatsapp:
        for u in users:
            if u.phone and campaign.message_template:
                msg = campaign.message_template.replace("{{name}}", u.name or "Guest")
                await send_whatsapp_text(u.phone, msg)
                sent += 1

    campaign.status = CampaignStatus.sent
    campaign.sent_at = datetime.now(timezone.utc)
    await db.commit()
    return {"sent": sent, "total_recipients": len(users)}


@router.get("/{campaign_id}/stats", dependencies=[Depends(require_manager)])
async def campaign_stats(campaign_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    stats_result = await db.execute(
        select(CampaignRecipient.status, func.count(CampaignRecipient.id).label("count"))
        .where(CampaignRecipient.campaign_id == campaign_id)
        .group_by(CampaignRecipient.status)
    )
    stats = {r.status: r.count for r in stats_result.all()}
    return {
        "id": str(campaign.id),
        "name": campaign.name,
        "status": campaign.status.value,
        "sent_at": campaign.sent_at.isoformat() if campaign.sent_at else None,
        "recipients": stats,
    }


@router.get("", dependencies=[Depends(require_manager)])
async def list_campaigns(skip: int = 0, limit: int = 30, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Campaign).order_by(Campaign.created_at.desc()).offset(skip).limit(limit)
    )
    return [{"id": str(c.id), "name": c.name, "type": c.type.value, "status": c.status.value} for c in result.scalars().all()]


@router.post("/whatsapp/webhook")
async def whatsapp_webhook_incoming(request: dict):
    """Process incoming WhatsApp webhook events (delivery status, replies)."""
    entry = request.get("entry", [])
    processed = 0
    for item in entry:
        changes = item.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            statuses = value.get("statuses", [])
            for status in statuses:
                msg_id = status.get("id", "")
                msg_status = status.get("status", "")
                # Log delivery status
                import logging
                logging.getLogger("temptations.whatsapp").info(
                    f"WhatsApp delivery status: message_id={msg_id}, status={msg_status}"
                )
                processed += 1
    return {"processed": processed}


@router.get("/analytics/summary", dependencies=[Depends(require_manager)])
async def campaign_analytics_summary(db: AsyncSession = Depends(get_db)):
    """Overall campaign performance summary."""
    total_result = await db.execute(select(func.count()).select_from(Campaign))
    total_campaigns = total_result.scalar() or 0

    sent_result = await db.execute(
        select(func.count()).select_from(Campaign).where(Campaign.status == CampaignStatus.sent)
    )
    sent_campaigns = sent_result.scalar() or 0

    total_recipients_result = await db.execute(
        select(func.count()).select_from(CampaignRecipient)
    )
    total_recipients = total_recipients_result.scalar() or 0

    delivered_result = await db.execute(
        select(func.count()).select_from(CampaignRecipient).where(CampaignRecipient.status == "sent")
    )
    delivered = delivered_result.scalar() or 0

    delivery_rate = round(delivered / total_recipients * 100, 1) if total_recipients > 0 else 0

    return {
        "total_campaigns": total_campaigns,
        "sent_campaigns": sent_campaigns,
        "total_recipients": total_recipients,
        "delivered": delivered,
        "delivery_rate_pct": delivery_rate,
    }
