"""Integration tests for the Orders API."""
import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

BRANCH_ID = "11111111-1111-1111-1111-111111111111"
MOCK_USER_ID = uuid.uuid4()


def _mock_user(role="customer"):
    """Create a mock user object for auth."""
    from unittest.mock import MagicMock
    user = MagicMock()
    user.id = MOCK_USER_ID
    user.role = role
    user.is_active = True
    user.firebase_uid = "test_uid"
    return user


class TestPlaceOrder:
    @pytest.mark.asyncio
    async def test_place_order_unauthenticated(self, client: AsyncClient):
        """Placing an order without auth returns 401."""
        r = await client.post("/api/v1/orders", json={
            "branch_id": BRANCH_ID,
            "order_type": "dine_in",
            "items": [{"menu_item_id": str(uuid.uuid4()), "quantity": 1}],
            "payment_method": "cash",
        })
        assert r.status_code == 401

    @pytest.mark.asyncio
    async def test_place_order_empty_items(self, client: AsyncClient):
        """Order with empty items list returns 422 (validation error)."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post("/api/v1/orders", json={
                "branch_id": BRANCH_ID,
                "order_type": "dine_in",
                "items": [],
                "payment_method": "cash",
            })
        assert r.status_code == 422

    @pytest.mark.asyncio
    async def test_place_order_invalid_item(self, client: AsyncClient):
        """Order with unavailable menu item returns 400."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post("/api/v1/orders", json={
                "branch_id": BRANCH_ID,
                "order_type": "dine_in",
                "items": [{"menu_item_id": str(uuid.uuid4()), "quantity": 1}],
                "payment_method": "cash",
            })
        assert r.status_code in (400, 404)


class TestListOrders:
    @pytest.mark.asyncio
    async def test_list_orders_unauthenticated(self, client: AsyncClient):
        """Listing orders without auth returns 401."""
        r = await client.get("/api/v1/orders")
        assert r.status_code == 401

    @pytest.mark.asyncio
    async def test_list_orders_authenticated(self, client: AsyncClient):
        """Authenticated user gets a list response."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.get("/api/v1/orders")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, (list, dict))


class TestOrderStatus:
    @pytest.mark.asyncio
    async def test_update_status_unauthorized(self, client: AsyncClient):
        """Non-staff cannot update order status."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.patch(
                f"/api/v1/orders/{uuid.uuid4()}/status",
                json={"status": "confirmed"},
            )
        assert r.status_code in (403, 404)

    @pytest.mark.asyncio
    async def test_cancel_nonexistent_order(self, client: AsyncClient):
        """Cancelling a non-existent order returns 404."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post(f"/api/v1/orders/{uuid.uuid4()}/cancel")
        assert r.status_code == 404


class TestCouponApplication:
    @pytest.mark.asyncio
    async def test_order_with_invalid_coupon(self, client: AsyncClient):
        """Order with invalid coupon still places (coupon is ignored or returns error)."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post("/api/v1/orders", json={
                "branch_id": BRANCH_ID,
                "order_type": "takeaway",
                "items": [{"menu_item_id": str(uuid.uuid4()), "quantity": 1}],
                "payment_method": "cash",
                "coupon_code": "INVALIDCOUPON99",
            })
        # Should fail because item is unavailable, not because of coupon
        assert r.status_code in (400, 404)
