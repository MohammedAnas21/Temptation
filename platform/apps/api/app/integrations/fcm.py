import logging
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_messaging():
    """Get Firebase messaging module, initializing SDK if needed."""
    from app.integrations.firebase import _init_firebase
    _init_firebase()
    try:
        from firebase_admin import messaging
        return messaging
    except Exception as e:
        logger.error(f"Firebase messaging unavailable: {e}")
        return None


async def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: dict | None = None,
) -> bool:
    """Send FCM push notification to a single device token using Firebase Admin SDK v1."""
    messaging = _get_messaging()
    if not messaging:
        logger.warning("FCM not configured — skipping push")
        return False

    message = messaging.Message(
        token=token,
        notification=messaging.Notification(title=title, body=body),
        data={k: str(v) for k, v in (data or {}).items()},
    )
    try:
        response = messaging.send(message)
        logger.info(f"FCM push sent (response: {response}) to token ending ...{token[-8:]}")
        return True
    except messaging.UnregisteredError:
        logger.warning(f"FCM token unregistered (device uninstalled): ...{token[-8:]}")
        return False
    except Exception as e:
        logger.error(f"FCM push failed: {e}")
        return False


async def send_push_multicast(tokens: list[str], title: str, body: str, data: dict | None = None) -> int:
    """Send FCM push to multiple tokens using Firebase Admin SDK v1 multicast.
    Returns count of successful sends."""
    if not tokens:
        return 0

    messaging = _get_messaging()
    if not messaging:
        return 0

    message = messaging.MulticastMessage(
        tokens=tokens,
        notification=messaging.Notification(title=title, body=body),
        data={k: str(v) for k, v in (data or {}).items()},
    )
    try:
        response = messaging.send_each_for_multicast(message)
        success_count = response.success_count
        logger.info(f"FCM multicast: {success_count}/{len(tokens)} delivered")

        # Log individual failures for debugging
        for idx, resp in enumerate(response.responses):
            if not resp.success:
                logger.warning(
                    f"FCM multicast failure for token ...{tokens[idx][-8:]}: {resp.exception}"
                )
        return success_count
    except Exception as e:
        logger.error(f"FCM multicast failed: {e}")
        return 0
