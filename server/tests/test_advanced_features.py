import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_scheduler_status_and_config():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/scheduler/status")
        assert res.status_code == 200
        data = res.json()
        assert "is_running" in data
        assert "interval_minutes" in data
        assert data["interval_minutes"] >= 5

        # Test config change
        cfg_res = await ac.post("/api/scheduler/config", json={"interval_minutes": 45})
        assert cfg_res.status_code == 200
        assert cfg_res.json()["interval_minutes"] == 45


@pytest.mark.asyncio
async def test_application_kit_drafter():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get an opportunity id
        opps_res = await ac.get("/api/opportunities")
        assert opps_res.status_code == 200
        opps = opps_res.json()
        assert len(opps) > 0
        opp_id = opps[0]["id"]

        # Draft application
        draft_res = await ac.post(
            f"/api/opportunities/{opp_id}/draft-application",
            json={"tone": "academic", "target_role": "Research Fellow"}
        )
        assert draft_res.status_code == 200
        draft = draft_res.json()
        assert "statement_of_purpose" in draft
        assert len(draft["statement_of_purpose"]) > 100
        assert "cold_email_pitch" in draft
        assert "application_checklist" in draft
        assert len(draft["application_checklist"]) >= 3
        assert draft["opportunity_id"] == opp_id


@pytest.mark.asyncio
async def test_calendar_export_ics():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Export all deadlines
        all_ics = await ac.get("/api/opportunities/export/all-deadlines.ics")
        assert all_ics.status_code == 200
        assert "text/calendar" in all_ics.headers.get("content-type", "")
        text = all_ics.text
        assert "BEGIN:VCALENDAR" in text
        assert "END:VCALENDAR" in text
        assert "BEGIN:VEVENT" in text
        assert "VALARM" in text

        # 2. Export single deadline
        opps_res = await ac.get("/api/opportunities")
        opp_id = opps_res.json()[0]["id"]
        single_ics = await ac.get(f"/api/opportunities/{opp_id}/calendar.ics")
        assert single_ics.status_code == 200
        assert "BEGIN:VCALENDAR" in single_ics.text
        assert "BEGIN:VEVENT" in single_ics.text


@pytest.mark.asyncio
async def test_telegram_config_and_test():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        cfg = await ac.get("/api/notifications/telegram/config")
        assert cfg.status_code == 200
        data = cfg.json()
        assert "is_configured" in data
        assert "channels" in data

        # Test diagnostic endpoint with dummy token
        test_res = await ac.post("/api/notifications/telegram/test", json={"bot_token": "dummy_tok", "chat_id": "12345"})
        assert test_res.status_code == 200
        assert "success" in test_res.json()
