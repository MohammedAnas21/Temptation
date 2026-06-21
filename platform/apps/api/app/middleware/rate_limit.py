import time
import hashlib
from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as aioredis
from app.config import get_settings
from app.integrations.firebase import verify_firebase_token

settings = get_settings()
_redis: aioredis.Redis | None = None

# In-memory token UID cache to prevent double Firebase verification
# Maps token hash -> (uid, expiry_timestamp)
_token_cache: dict[str, tuple[str, float]] = {}
_TOKEN_CACHE_TTL = 300  # 5 minutes


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


def _token_hash(token: str) -> str:
    """Fast hash of token for cache key (not for security)."""
    return hashlib.sha256(token.encode()).hexdigest()[:32]


async def _resolve_uid(token: str) -> str | None:
    """Resolve Firebase UID from token with in-memory caching."""
    now = time.time()
    h = _token_hash(token)

    # Check cache first
    cached = _token_cache.get(h)
    if cached:
        uid, expiry = cached
        if now < expiry:
            return uid
        else:
            del _token_cache[h]

    # Verify with Firebase
    decoded = await verify_firebase_token(token)
    if decoded:
        uid = decoded.get("uid")
        if uid:
            _token_cache[h] = (uid, now + _TOKEN_CACHE_TTL)
            # Evict stale entries periodically (keep cache bounded)
            if len(_token_cache) > 10000:
                stale = [k for k, (_, exp) in _token_cache.items() if now >= exp]
                for k in stale:
                    del _token_cache[k]
            return uid
    return None


# Paths exempt from rate limiting (webhooks, health, docs)
_RATE_LIMIT_SKIP_PREFIXES = (
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/api/v1/payments/webhooks/",
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path in _RATE_LIMIT_SKIP_PREFIXES or any(
            path.startswith(p) for p in _RATE_LIMIT_SKIP_PREFIXES if p.endswith("/")
        ):
            return await call_next(request)

        auth_header = request.headers.get("authorization", "")
        auth_uid: str | None = None
        if auth_header.startswith("Bearer "):
            auth_uid = await _resolve_uid(auth_header.removeprefix("Bearer ").strip())

        peer_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        client_ip = forwarded_for if peer_ip in settings.trusted_proxy_ips and forwarded_for else peer_ip
        identity = f"user:{auth_uid}" if auth_uid else f"ip:{client_ip}"
        key = f"rate:{identity}:{int(time.time() // 60)}"
        limit = settings.rate_limit_authenticated if auth_uid else settings.rate_limit_public

        count = 1
        try:
            redis = await get_redis()
            count = await redis.incr(key)
            if count == 1:
                await redis.expire(key, 60)
        except Exception:
            # Redis unavailable — allow request but log; do not block traffic
            import logging
            logging.getLogger("temptations.rate_limit").warning(
                "Redis unavailable; rate limiting disabled for this request"
            )

        if count > limit:
            from starlette.responses import JSONResponse
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": f"Rate limit exceeded. Max {limit} requests per minute."},
                headers={"Retry-After": "60"},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - count))
        return response
