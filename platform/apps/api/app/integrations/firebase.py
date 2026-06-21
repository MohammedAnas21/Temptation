from typing import Optional
import firebase_admin
from firebase_admin import credentials, auth
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
_initialized = False


def _init_firebase():
    global _initialized
    if _initialized:
        return
    settings = get_settings()
    if not settings.firebase_project_id or not settings.firebase_private_key:
        if settings.is_production:
            raise RuntimeError("Firebase credentials are required in production")
        logger.warning("Firebase credentials not configured — auth disabled in development")
        return
    try:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            "client_email": settings.firebase_client_email,
        })
        firebase_admin.initialize_app(cred)
        _initialized = True
        logger.info("Firebase Admin SDK initialized")
    except Exception as e:
        if settings.is_production:
            raise RuntimeError(f"Firebase initialization failed in production: {e}") from e
        logger.warning(f"Firebase init failed (running without auth): {e}")


async def verify_firebase_token(token: str) -> Optional[dict]:
    _init_firebase()
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.warning(f"Firebase token verification failed: {e}")
        return None
