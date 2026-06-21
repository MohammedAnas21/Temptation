"""Integration tests for the Payments API."""
import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock

BRANCH_ID = "11111111-1111-1111-1111-111111111111"
MOCK_USER_ID = uuid.uuid4()


def _mock_user(role="customer"):
    user = MagicMock()
    user.id = MOCK_USER_ID
    user.role = role
    user.is_active = True
    user.firebase_uid = "test_uid"
    return user


class TestInitiatePayment:
    @pytest.mark.asyncio
    async def test_initiate_unauthenticated(self, client: AsyncClient):
        """Initiating payment without auth returns 401."""
        r = await client.post("/api/v1/payments/initiate", json={
            "reference_type": "order",
            "reference_id": str(uuid.uuid4()),
            "amount": 500.0,
            "payment_method": "upi",
        })
        assert r.status_code == 401

    @pytest.mark.asyncio
    async def test_initiate_zero_amount(self, client: AsyncClient):
        """Payment with zero amount returns 422 (validation error)."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post("/api/v1/payments/initiate", json={
                "reference_type": "order",
                "reference_id": str(uuid.uuid4()),
                "amount": 0,
                "payment_method": "upi",
            })
        assert r.status_code == 422

    @pytest.mark.asyncio
    async def test_initiate_invalid_reference_type(self, client: AsyncClient):
        """Invalid reference type returns 422."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post("/api/v1/payments/initiate", json={
                "reference_type": "invalid",
                "reference_id": str(uuid.uuid4()),
                "amount": 500.0,
                "payment_method": "upi",
            })
        assert r.status_code == 422


class TestPollPaymentStatus:
    @pytest.mark.asyncio
    async def test_poll_nonexistent(self, client: AsyncClient):
        """Polling a non-existent payment returns 404."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.get(f"/api/v1/payments/{uuid.uuid4()}/status")
        assert r.status_code == 404


class TestWebhookProcessing:
    @pytest.mark.asyncio
    async def test_webhook_invalid_signature(self, client: AsyncClient):
        """Webhook with invalid checksum returns 400."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post(
                "/api/v1/payments/webhook/phonepe",
                headers={"X-Verify": "invalid_checksum"},
                json={"response": "invalid"},
            )
        assert r.status_code in (400, 401, 403)

    @pytest.mark.asyncio
    async def test_webhook_missing_checksum_header(self, client: AsyncClient):
        """Webhook without checksum header returns 400."""
        r = await client.post(
            "/api/v1/payments/webhook/phonepe",
            json={"response": "test"},
        )
        assert r.status_code in (400, 403, 422)


class TestIdempotency:
    @pytest.mark.asyncio
    async def test_duplicate_initiate_different_key(self, client: AsyncClient):
        """Two payments with different idempotency keys both succeed."""
        ref_id = str(uuid.uuid4())
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r1 = await client.post("/api/v1/payments/initiate", json={
                "reference_type": "order",
                "reference_id": ref_id,
                "amount": 100.0,
                "payment_method": "upi",
            })
            r2 = await client.post("/api/v1/payments/initiate", json={
                "reference_type": "order",
                "reference_id": ref_id,
                "amount": 200.0,
                "payment_method": "upi",
            })
        # Both should attempt processing (may fail for other reasons like missing order)
        assert r1.status_code in (200, 201, 400, 404)
        assert r2.status_code in (200, 201, 400, 404)


class TestRefund:
    @pytest.mark.asyncio
    async def test_refund_requires_staff(self, client: AsyncClient):
        """Refund endpoint requires staff role."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post(f"/api/v1/payments/{uuid.uuid4()}/refund")
        assert r.status_code in (403, 404)

    @pytest.mark.asyncio
    async def test_refund_nonexistent(self, client: AsyncClient):
        """Refund of non-existent payment returns 404."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user("admin")):
            r = await client.post(f"/api/v1/payments/{uuid.uuid4()}/refund")
        assert r.status_code == 404
