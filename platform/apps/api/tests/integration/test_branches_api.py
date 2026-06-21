"""Integration tests for branches API."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_branches_public(client: AsyncClient):
    resp = await client.get("/api/v1/branches")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
