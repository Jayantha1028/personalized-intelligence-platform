import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_saved_items_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Save an opportunity
        res = await ac.post("/api/saved-items", json={
            "item_type": "opportunity",
            "item_id": 1,
            "notes": "Must prepare marksheet translation"
        })
        assert res.status_code == 200
        saved_id = res.json()["id"]

        # 2. List saved items
        list_res = await ac.get("/api/saved-items")
        assert list_res.status_code == 200
        items = list_res.json()
        assert len(items) >= 1
        assert any(i["id"] == saved_id for i in items)

        # 3. Delete saved item
        del_res = await ac.delete(f"/api/saved-items/{saved_id}")
        assert del_res.status_code == 200


@pytest.mark.asyncio
async def test_application_tracking_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Track opportunity as 'interested'
        create_res = await ac.post("/api/applications", json={
            "opportunity_id": 1,
            "status": "in_progress",
            "notes": "Drafting proposal"
        })
        assert create_res.status_code == 200
        app_id = create_res.json()["id"]
        assert create_res.json()["status"] == "in_progress"

        # 2. Update status to 'applied'
        up_res = await ac.put(f"/api/applications/{app_id}", json={
            "status": "applied",
            "notes": "Submitted application on NSP portal"
        })
        assert up_res.status_code == 200
        assert up_res.json()["status"] == "applied"

        # 3. List tracked applications
        list_res = await ac.get("/api/applications")
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1


@pytest.mark.asyncio
async def test_notification_dispatcher_idempotency():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Trigger first notification dispatch
        dispatch_res = await ac.post("/api/notifications/dispatch")
        assert dispatch_res.status_code == 200
        first_count = dispatch_res.json()["newly_generated_alerts"]

        # 2. Trigger second notification dispatch immediately
        # Idempotency check: exactly 0 duplicate alerts should be generated
        second_res = await ac.post("/api/notifications/dispatch")
        assert second_res.status_code == 200
        assert second_res.json()["newly_generated_alerts"] == 0

        # 3. Check notifications list
        list_res = await ac.get("/api/notifications")
        assert list_res.status_code == 200
        data = list_res.json()
        assert "unread_count" in data
        assert "items" in data

        if data["items"]:
            first_notif_id = data["items"][0]["id"]
            # 4. Mark single notification as read
            read_res = await ac.put(f"/api/notifications/{first_notif_id}/read")
            assert read_res.status_code == 200
            assert read_res.json()["is_read"] is True
