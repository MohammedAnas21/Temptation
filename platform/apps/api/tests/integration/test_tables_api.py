import pytest
import uuid
from datetime import date, time
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_tables_empty(client: AsyncClient):
    r = await client.get(f"/api/v1/tables?branch_id={uuid.uuid4()}")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_table_availability(client: AsyncClient):
    r = await client.get(
        f"/api/v1/tables/availability",
        params={
            "branch_id": str(uuid.uuid4()),
            "reservation_date": str(date.today()),
            "reservation_time": "19:00:00",
            "guests": 2,
        }
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_update_table_status_unauthorized(client: AsyncClient):
    """Unauthenticated request to update table status returns 401."""
    r = await client.patch(f"/api/v1/tables/{uuid.uuid4()}/status", json={"status": "cleaning"})
    assert r.status_code == 401
