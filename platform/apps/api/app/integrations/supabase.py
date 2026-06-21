import httpx
import logging
import mimetypes
import uuid
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def upload_file(file_bytes: bytes, filename: str, folder: str = "general") -> str | None:
    """Upload a file to Supabase Storage. Returns public URL or None."""
    if not settings.supabase_url or not settings.supabase_service_key:
        logger.warning("Supabase not configured — file upload skipped")
        return None

    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    unique_name = f"{folder}/{uuid.uuid4()}.{ext}"
    content_type, _ = mimetypes.guess_type(filename)
    content_type = content_type or "application/octet-stream"

    url = f"{settings.supabase_url}/storage/v1/object/{settings.supabase_storage_bucket}/{unique_name}"
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "Content-Type": content_type,
    }
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, content=file_bytes, headers=headers)
            resp.raise_for_status()
            public_url = f"{settings.supabase_url}/storage/v1/object/public/{settings.supabase_storage_bucket}/{unique_name}"
            logger.info(f"File uploaded: {public_url}")
            return public_url
    except Exception as e:
        logger.error(f"Supabase upload failed: {e}")
        return None


async def delete_file(file_path: str) -> bool:
    """Delete a file from Supabase Storage by its path."""
    if not settings.supabase_url or not settings.supabase_service_key:
        return False
    url = f"{settings.supabase_url}/storage/v1/object/{settings.supabase_storage_bucket}/{file_path}"
    headers = {"Authorization": f"Bearer {settings.supabase_service_key}"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.delete(url, headers=headers)
            return resp.status_code in (200, 204)
    except Exception as e:
        logger.error(f"Supabase delete failed: {e}")
        return False
