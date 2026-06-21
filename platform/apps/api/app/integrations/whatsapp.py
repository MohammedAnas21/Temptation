import httpx
import logging
import asyncio
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Max retry attempts for transient failures
_MAX_RETRIES = 3
_RETRY_DELAYS = [1, 3, 9]  # exponential backoff in seconds


async def send_whatsapp_template(
    to_phone: str,
    template_name: str,
    language_code: str = "en",
    components: list | None = None,
) -> bool:
    """Send a WhatsApp template message via Meta Business API with retry logic."""
    if not settings.whatsapp_token or not settings.whatsapp_phone_number_id:
        logger.warning("WhatsApp not configured — skipping send")
        return False

    url = f"{settings.whatsapp_api_url}/{settings.whatsapp_phone_number_id}/messages"
    headers = {"Authorization": f"Bearer {settings.whatsapp_token}", "Content-Type": "application/json"}
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": language_code},
            "components": components or [],
        },
    }
    return await _send_with_retry(url, headers, payload, to_phone, template_name)


async def send_whatsapp_text(to_phone: str, message: str) -> bool:
    """Send a plain text WhatsApp message (for testing/non-template) with retry logic."""
    if not settings.whatsapp_token:
        return False
    url = f"{settings.whatsapp_api_url}/{settings.whatsapp_phone_number_id}/messages"
    headers = {"Authorization": f"Bearer {settings.whatsapp_token}", "Content-Type": "application/json"}
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": message},
    }
    return await _send_with_retry(url, headers, payload, to_phone, "text")


async def _send_with_retry(url: str, headers: dict, payload: dict, to_phone: str, label: str) -> bool:
    """Send WhatsApp message with exponential backoff retry on transient failures."""
    for attempt in range(_MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    result = resp.json()
                    message_id = result.get("messages", [{}])[0].get("id", "")
                    logger.info(f"WhatsApp sent to {to_phone}: {label} (id: {message_id})")
                    return True
                elif resp.status_code in (429, 500, 502, 503, 504):
                    # Transient failure — retry with backoff
                    delay = _RETRY_DELAYS[attempt] if attempt < len(_RETRY_DELAYS) else 15
                    logger.warning(f"WhatsApp transient error {resp.status_code} for {to_phone}, retrying in {delay}s (attempt {attempt + 1}/{_MAX_RETRIES})")
                    await asyncio.sleep(delay)
                    continue
                else:
                    # Permanent failure
                    logger.error(f"WhatsApp send failed permanently for {to_phone}: {resp.status_code} {resp.text[:200]}")
                    return False
        except (httpx.TimeoutException, httpx.ConnectError) as e:
            delay = _RETRY_DELAYS[attempt] if attempt < len(_RETRY_DELAYS) else 15
            logger.warning(f"WhatsApp network error for {to_phone}: {e}, retrying in {delay}s (attempt {attempt + 1}/{_MAX_RETRIES})")
            await asyncio.sleep(delay)
            continue
        except Exception as e:
            logger.error(f"WhatsApp unexpected error for {to_phone}: {e}")
            return False

    logger.error(f"WhatsApp send exhausted retries for {to_phone}: {label}")
    return False


def verify_whatsapp_webhook(body: dict, hub_mode: str | None, hub_challenge: str | None, hub_verify_token: str | None) -> dict | None:
    """Verify WhatsApp webhook subscription (GET request).
    Returns challenge string if valid, None otherwise."""
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_token:
        return {"hub.challenge": hub_challenge}
    return None
