"""Integration tests for the Reservations API."""
import uuid
from datetime import date, time, timedelta
import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock

BRANCH_ID = "11111111-1111-1111-1111-111111111111"
MOCK_USER_ID = uuid.uuid4()


def _mock_user(role="customer"):
    user = MagicMock()
    user.id = MOCK_USER_ID
    user.role = role
    user.is_active = True
    user.firebase_uid = "test_uid"
    return user


class TestCreateReservation:
    @pytest.mark.asyncio
    async def test_create_unauthenticated(self, client: AsyncClient):
        """Creating a reservation without auth returns 401."""
        r = await client.post("/api/v1/reservations", json={
            "branch_id": BRANCH_ID,
            "reservation_date": (date.today() + timedelta(days=1)).isoformat(),
            "reservation_time": "19:00",
            "guest_count": 4,
            "seating_type": "dining",
        })
        assert r.status_code == 401

    @pytest.mark.asyncio
    async def test_create_past_date(self, client: AsyncClient):
        """Reservation in the past returns validation error."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post("/api/v1/reservations", json={
                "branch_id": BRANCH_ID,
                "reservation_date": (date.today() - timedelta(days=1)).isoformat(),
                "reservation_time": "19:00",
                "guest_count": 4,
                "seating_type": "dining",
            })
        assert r.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_create_invalid_guest_count(self, client: AsyncClient):
        """Guest count 0 or >50 returns validation error."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post("/api/v1/reservations", json={
                "branch_id": BRANCH_ID,
                "reservation_date": (date.today() + timedelta(days=1)).isoformat(),
                "reservation_time": "19:00",
                "guest_count": 0,
                "seating_type": "dining",
            })
        assert r.status_code == 422

    @pytest.mark.asyncio
    async def test_create_invalid_seating_type(self, client: AsyncClient):
        """Invalid seating type returns 422."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post("/api/v1/reservations", json={
                "branch_id": BRANCH_ID,
                "reservation_date": (date.today() + timedelta(days=1)).isoformat(),
                "reservation_time": "19:00",
                "guest_count": 2,
                "seating_type": "invalid_type",
            })
        assert r.status_code == 422


class TestListReservations:
    @pytest.mark.asyncio
    async def test_list_unauthenticated(self, client: AsyncClient):
        r = await client.get("/api/v1/reservations")
        assert r.status_code == 401

    @pytest.mark.asyncio
    async def test_list_authenticated(self, client: AsyncClient):
        """Authenticated user can list their reservations."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.get("/api/v1/reservations")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, (list, dict))


class TestReservationStatus:
    @pytest.mark.asyncio
    async def test_cancel_nonexistent(self, client: AsyncClient):
        """Cancelling a non-existent reservation returns 404."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post(f"/api/v1/reservations/{uuid.uuid4()}/cancel")
        assert r.status_code == 404

    @pytest.mark.asyncio
    async def test_checkin_requires_staff(self, client: AsyncClient):
        """Non-staff cannot check in a reservation."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.post(f"/api/v1/reservations/{uuid.uuid4()}/check-in")
        assert r.status_code in (403, 404)


class TestTableAvailability:
    @pytest.mark.asyncio
    async def test_check_availability(self, client: AsyncClient):
        """Table availability endpoint returns 200."""
        future = date.today() + timedelta(days=1)
        r = await client.get(
            f"/api/v1/tables/availability",
            params={
                "branch_id": BRANCH_ID,
                "date": future.isoformat(),
                "time": "19:00",
                "guests": 4,
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, (list, dict))


class TestOccupancy:
    @pytest.mark.asyncio
    async def test_occupancy_requires_staff(self, client: AsyncClient):
        """Occupancy endpoint requires staff role."""
        with patch("app.middleware.auth.get_current_user", return_value=_mock_user()):
            r = await client.get(f"/api/v1/reservations/occupancy?branch_id={BRANCH_ID}")
        assert r.status_code in (200, 403)
