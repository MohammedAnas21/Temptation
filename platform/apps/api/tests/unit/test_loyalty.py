import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.loyalty import (
    _compute_tier, earn_from_order, redeem_points,
    award_points, get_or_create_account
)
from app.models.loyalty import LoyaltyTierName, LoyaltyTransactionType, LoyaltyAccount


class TestComputeTier:
    def test_bronze_zero(self):
        assert _compute_tier(0) == LoyaltyTierName.bronze

    def test_bronze_top(self):
        assert _compute_tier(999) == LoyaltyTierName.bronze

    def test_silver_start(self):
        assert _compute_tier(1000) == LoyaltyTierName.silver

    def test_silver_mid(self):
        assert _compute_tier(3000) == LoyaltyTierName.silver

    def test_silver_top(self):
        assert _compute_tier(4999) == LoyaltyTierName.silver

    def test_gold_start(self):
        assert _compute_tier(5000) == LoyaltyTierName.gold

    def test_gold_high(self):
        assert _compute_tier(99999) == LoyaltyTierName.gold


class TestLoyaltyService:
    @pytest.mark.asyncio
    async def test_earn_from_order_basic(self):
        """₹500 order should earn 50 base points (1 per ₹10)."""
        db = AsyncMock()
        user_id = uuid.uuid4()
        order_id = uuid.uuid4()

        mock_account = LoyaltyAccount(
            user_id=user_id, points_balance=0,
            lifetime_points=0, tier=LoyaltyTierName.bronze
        )
        with patch("app.services.loyalty.get_or_create_account", return_value=mock_account):
            with patch("app.services.loyalty.award_points", return_value=mock_account) as mock_award:
                points = await earn_from_order(db, user_id, 500.0, order_id)
                assert points == 50
                mock_award.assert_called_once()

    @pytest.mark.asyncio
    async def test_redeem_points_insufficient(self):
        """Redeeming more points than balance raises ValueError."""
        db = AsyncMock()
        user_id = uuid.uuid4()
        order_id = uuid.uuid4()

        mock_account = LoyaltyAccount(
            user_id=user_id, points_balance=50,
            lifetime_points=50, tier=LoyaltyTierName.bronze
        )
        with patch("app.services.loyalty.get_or_create_account", return_value=mock_account):
            with pytest.raises(ValueError, match="Insufficient points"):
                await redeem_points(db, user_id, 200, order_id)

    @pytest.mark.asyncio
    async def test_redeem_points_below_minimum(self):
        """Redeeming fewer than minimum points raises ValueError."""
        db = AsyncMock()
        user_id = uuid.uuid4()
        order_id = uuid.uuid4()

        mock_account = LoyaltyAccount(
            user_id=user_id, points_balance=500,
            lifetime_points=500, tier=LoyaltyTierName.bronze
        )
        with patch("app.services.loyalty.get_or_create_account", return_value=mock_account):
            with pytest.raises(ValueError, match="Minimum redemption"):
                await redeem_points(db, user_id, 50, order_id)

    @pytest.mark.asyncio
    async def test_redeem_points_success(self):
        """100 points → ₹10 discount."""
        db = AsyncMock()
        db.add = MagicMock()
        db.flush = AsyncMock()
        user_id = uuid.uuid4()
        order_id = uuid.uuid4()

        mock_account = LoyaltyAccount(
            user_id=user_id, points_balance=500,
            lifetime_points=500, tier=LoyaltyTierName.bronze
        )
        with patch("app.services.loyalty.get_or_create_account", return_value=mock_account):
            discount = await redeem_points(db, user_id, 100, order_id)
            assert discount == 10.0
            assert mock_account.points_balance == 400
