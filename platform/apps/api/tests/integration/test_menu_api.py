import pytest
import uuid
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_list_menu_items_empty(client: AsyncClient):
    """Menu items endpoint returns 200 with empty list for unknown branch."""
    r = await client.get(f"/api/v1/menu/items?branch_id={uuid.uuid4()}")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_list_categories_empty(client: AsyncClient):
    r = await client.get(f"/api/v1/menu/categories?branch_id={uuid.uuid4()}")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_get_nonexistent_item(client: AsyncClient):
    r = await client.get(f"/api/v1/menu/items/{uuid.uuid4()}")
    assert r.status_code == 404
