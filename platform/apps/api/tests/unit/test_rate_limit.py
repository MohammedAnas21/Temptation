import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.middleware import rate_limit
from app.middleware.rate_limit import RateLimitMiddleware


class FakeRedis:
    def __init__(self):
        self.values: dict[str, int] = {}

    async def incr(self, key: str) -> int:
        self.values[key] = self.values.get(key, 0) + 1
        return self.values[key]

    async def expire(self, key: str, seconds: int) -> None:
        return None


def build_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware)

    @app.get("/limited")
    async def limited():
        return {"ok": True}

    return app


async def fake_decode_none(token: str):
    return None


async def fake_decode_user(token: str):
    return {"uid": "admin-1"}


@pytest.mark.asyncio
async def test_bearer_header_without_valid_token_uses_public_limit(monkeypatch):
    fake_redis = FakeRedis()
    async def get_redis():
        return fake_redis

    monkeypatch.setattr(rate_limit, "get_redis", get_redis)
    monkeypatch.setattr(rate_limit, "verify_firebase_token", fake_decode_none)
    monkeypatch.setattr(rate_limit.settings, "rate_limit_public", 2)
    monkeypatch.setattr(rate_limit.settings, "rate_limit_authenticated", 10)
    monkeypatch.setattr(rate_limit.settings, "trusted_proxy_ips", [])

    async with AsyncClient(transport=ASGITransport(app=build_app()), base_url="http://test") as client:
        assert (await client.get("/limited", headers={"Authorization": "Bearer forged"})).status_code == 200
        assert (await client.get("/limited", headers={"Authorization": "Bearer forged"})).status_code == 200
        assert (await client.get("/limited", headers={"Authorization": "Bearer forged"})).status_code == 429


@pytest.mark.asyncio
async def test_valid_token_uses_authenticated_identity_limit(monkeypatch):
    fake_redis = FakeRedis()
    async def get_redis():
        return fake_redis

    monkeypatch.setattr(rate_limit, "get_redis", get_redis)
    monkeypatch.setattr(rate_limit, "verify_firebase_token", fake_decode_user)
    monkeypatch.setattr(rate_limit.settings, "rate_limit_public", 1)
    monkeypatch.setattr(rate_limit.settings, "rate_limit_authenticated", 2)
    monkeypatch.setattr(rate_limit.settings, "trusted_proxy_ips", [])

    async with AsyncClient(transport=ASGITransport(app=build_app()), base_url="http://test") as client:
        assert (await client.get("/limited", headers={"Authorization": "Bearer valid"})).status_code == 200
        assert (await client.get("/limited", headers={"Authorization": "Bearer valid"})).status_code == 200
        assert (await client.get("/limited", headers={"Authorization": "Bearer valid"})).status_code == 429


@pytest.mark.asyncio
async def test_x_forwarded_for_is_ignored_without_trusted_proxy(monkeypatch):
    fake_redis = FakeRedis()
    async def get_redis():
        return fake_redis

    monkeypatch.setattr(rate_limit, "get_redis", get_redis)
    monkeypatch.setattr(rate_limit, "verify_firebase_token", fake_decode_none)
    monkeypatch.setattr(rate_limit.settings, "rate_limit_public", 2)
    monkeypatch.setattr(rate_limit.settings, "rate_limit_authenticated", 10)
    monkeypatch.setattr(rate_limit.settings, "trusted_proxy_ips", [])

    async with AsyncClient(transport=ASGITransport(app=build_app()), base_url="http://test") as client:
        assert (await client.get("/limited", headers={"X-Forwarded-For": "198.51.100.1"})).status_code == 200
        assert (await client.get("/limited", headers={"X-Forwarded-For": "198.51.100.2"})).status_code == 200
        assert (await client.get("/limited", headers={"X-Forwarded-For": "198.51.100.3"})).status_code == 429
