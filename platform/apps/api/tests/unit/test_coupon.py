import pytest
import uuid
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timezone, timedelta
from app.services.coupon import validate_coupon
from app.models.marketing import Coupon, CouponType


def _make_coupon(**kwargs) -> Coupon:
    defaults = dict(
        id=uuid.uuid4(), code="SAVE10", type=CouponType.percentage,
        value=10.0, min_order_value=100.0, max_discount=None,
        usage_limit=None, used_count=0, is_active=True,
        valid_from=None, valid_until=None,
    )
    defaults.update(kwargs)
    c = MagicMock(spec=Coupon)
    for k, v in defaults.items():
        setattr(c, k, v)
    return c


class TestValidateCoupon:
    @pytest.mark.asyncio
    async def test_valid_percentage_coupon(self):
        coupon = _make_coupon()
        db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = coupon
        mock_prev = MagicMock()
        mock_prev.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(side_effect=[mock_result, mock_prev])

        result = await validate_coupon(db, "SAVE10", uuid.uuid4(), 500.0)
        assert result["discount"] == 50.0
        assert result["code"] == "SAVE10"

    @pytest.mark.asyncio
    async def test_invalid_coupon_code(self):
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(ValueError, match="Invalid or inactive"):
            await validate_coupon(db, "BADCODE", uuid.uuid4(), 500.0)

    @pytest.mark.asyncio
    async def test_expired_coupon(self):
        coupon = _make_coupon(valid_until=datetime.now(timezone.utc) - timedelta(days=1))
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = coupon
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(ValueError, match="expired"):
            await validate_coupon(db, "SAVE10", uuid.uuid4(), 500.0)

    @pytest.mark.asyncio
    async def test_below_minimum_order(self):
        coupon = _make_coupon(min_order_value=500.0)
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = coupon
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(ValueError, match="Minimum order"):
            await validate_coupon(db, "SAVE10", uuid.uuid4(), 200.0)

    @pytest.mark.asyncio
    async def test_flat_coupon(self):
        coupon = _make_coupon(type=CouponType.flat, value=50.0, min_order_value=0.0)
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = coupon
        mock_prev = MagicMock()
        mock_prev.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(side_effect=[mock_result, mock_prev])

        result = await validate_coupon(db, "FLAT50", uuid.uuid4(), 300.0)
        assert result["discount"] == 50.0

    @pytest.mark.asyncio
    async def test_max_discount_cap(self):
        coupon = _make_coupon(type=CouponType.percentage, value=50.0, max_discount=100.0, min_order_value=0.0)
        db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = coupon
        mock_prev = MagicMock()
        mock_prev.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(side_effect=[mock_result, mock_prev])

        # 50% of ₹500 = ₹250, capped at ₹100
        result = await validate_coupon(db, "BIG50", uuid.uuid4(), 500.0)
        assert result["discount"] == 100.0
