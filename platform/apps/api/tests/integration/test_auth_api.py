import pytest
from httpx import AsyncClient
from unittest.mock import patch


@pytest.mark.asyncio
async def test_verify_invalid_token(client: AsyncClient):
    """Invalid Firebase token returns 401."""
    with patch("app.integrations.firebase.verify_firebase_token", return_value=None):
        r = await client.post("/api/v1/auth/verify", json={"id_token": "bad-token"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_verify_valid_token_creates_user(client: AsyncClient, db):
    """Valid Firebase token creates user and returns profile."""
    fake_uid = "firebase_test_uid_001"
    with patch("app.integrations.firebase.verify_firebase_token", return_value={
        "uid": fake_uid,
        "phone_number": "+919876543210",
        "email": "test@example.com",
        "name": "Test User",
    }):
        r = await client.post("/api/v1/auth/verify", json={"id_token": "valid-token"})
    assert r.status_code == 200
    data = r.json()
    assert data["firebase_uid"] == fake_uid
    assert data["role"] == "customer"
    assert data["referral_code"] is not None
    assert len(data["referral_code"]) == 8


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_verify_same_user_twice(client: AsyncClient):
    """Calling verify twice for same Firebase UID should not duplicate user."""
    fake_uid = "firebase_test_uid_002"
    decoded = {"uid": fake_uid, "phone_number": "+910000000001", "name": "Dupe Test"}
    with patch("app.integrations.firebase.verify_firebase_token", return_value=decoded):
        r1 = await client.post("/api/v1/auth/verify", json={"id_token": "token"})
        r2 = await client.post("/api/v1/auth/verify", json={"id_token": "token"})
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r1.json()["id"] == r2.json()["id"]
