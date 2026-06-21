import hashlib
import base64
import json
import uuid
import httpx
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _compute_checksum(payload_b64: str, endpoint: str, salt_key: str, salt_index: str) -> str:
    data = payload_b64 + endpoint + salt_key
    sha256 = hashlib.sha256(data.encode()).hexdigest()
    return f"{sha256}###{salt_index}"


async def initiate_payment(
    amount_paise: int,
    merchant_txn_id: str,
    user_id: str,
    redirect_url: str,
    callback_url: str,
    mobile: str | None = None,
) -> dict:
    """Initiate a PhonePe payment. Returns redirect_url or error."""
    payload = {
        "merchantId": settings.phonepe_merchant_id,
        "merchantTransactionId": merchant_txn_id,
        "merchantUserId": f"MU{user_id[:16]}",
        "amount": amount_paise,
        "redirectUrl": redirect_url,
        "redirectMode": "REDIRECT",
        "callbackUrl": callback_url,
        "paymentInstrument": {"type": "PAY_PAGE"},
    }
    if mobile:
        payload["mobileNumber"] = mobile

    payload_json = json.dumps(payload)
    payload_b64 = base64.b64encode(payload_json.encode()).decode()
    endpoint = "/pg/v1/pay"
    checksum = _compute_checksum(payload_b64, endpoint, settings.phonepe_salt_key, settings.phonepe_salt_index)

    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": settings.phonepe_merchant_id,
    }
    body = {"request": payload_b64}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(f"{settings.phonepe_base_url}{endpoint}", json=body, headers=headers)
            data = resp.json()
            if data.get("success"):
                pg_url = data["data"]["instrumentResponse"]["redirectInfo"]["url"]
                return {"success": True, "redirect_url": pg_url, "txn_id": merchant_txn_id}
            return {"success": False, "error": data.get("message", "PhonePe error")}
    except Exception as e:
        logger.error(f"PhonePe initiate failed: {e}")
        return {"success": False, "error": str(e)}


def verify_webhook_checksum(x_verify_header: str, response_b64: str) -> bool:
    """Verify PhonePe webhook signature."""
    endpoint = "/pg/v1/status"
    expected = _compute_checksum(response_b64, endpoint, settings.phonepe_salt_key, settings.phonepe_salt_index)
    return x_verify_header == expected


async def check_payment_status(merchant_txn_id: str) -> dict:
    """Check payment status via PhonePe status API."""
    endpoint = f"/pg/v1/status/{settings.phonepe_merchant_id}/{merchant_txn_id}"
    checksum = _compute_checksum("", endpoint, settings.phonepe_salt_key, settings.phonepe_salt_index)
    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": settings.phonepe_merchant_id,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"{settings.phonepe_base_url}{endpoint}", headers=headers)
            return resp.json()
    except Exception as e:
        logger.error(f"PhonePe status check failed: {e}")
        return {"success": False, "error": str(e)}
