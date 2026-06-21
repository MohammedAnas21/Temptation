"""Unit tests for loyalty refund and earn logic."""
import uuid
import pytest
from app.services.loyalty import award_points, refund_points, get_or_create_account
from app.models.loyalty import LoyaltyTransactionType


@pytest.mark.asyncio
async def test_refund_points_does_not_inflate_lifetime(db):
    user_id = uuid.uuid4()
    account = await get_or_create_account(db, user_id)
    await award_points(db, user_id, 500, LoyaltyTransactionType.earn, uuid.uuid4())
    lifetime_after_earn = account.lifetime_points

    await refund_points(db, user_id, 100, uuid.uuid4(), "Test refund")
    await db.flush()

    assert account.points_balance == 500  # 500 earned, 100 refunded (simulating cancel)
    assert account.lifetime_points == lifetime_after_earn


@pytest.mark.asyncio
async def test_manual_award_does_not_inflate_lifetime(db):
    user_id = uuid.uuid4()
    account = await get_or_create_account(db, user_id)
    await award_points(db, user_id, 200, LoyaltyTransactionType.manual, uuid.uuid4())
    assert account.lifetime_points == 0
    assert account.points_balance == 200
