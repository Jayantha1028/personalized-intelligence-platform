"""Tests for collected microservices integrated modules."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_circular_intelligence():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Samples
        res = await client.get("/api/circulars/samples")
        assert res.status_code == 200
        samples = res.json()
        assert len(samples) >= 3

        # 2. Analyze circular
        payload = {
            "title": "Karnataka State Post-Matric Scholarship",
            "provider": "Department of Social Welfare",
            "category": "scholarship",
            "text": samples[0]["text"]
        }
        analyze_res = await client.post("/api/circulars/analyze", json=payload)
        assert analyze_res.status_code == 200
        data = analyze_res.json()
        assert "extracted_entities" in data
        assert len(data["extracted_entities"]["dates"]) > 0
        assert data["detected_deadline"] is not None
        assert data["detected_currency"] == "INR"
        assert len(data["eligibility_signals"]) > 0
        assert data["confidence_score"] >= 0.7


@pytest.mark.asyncio
async def test_security_advisories():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. List advisories
        res = await client.get("/api/security/advisories")
        assert res.status_code == 200
        data = res.json()
        assert "advisories" in data
        assert "summary" in data
        assert data["summary"]["total_tracked"] > 0

        # 2. Filter by severity
        crit_res = await client.get("/api/security/advisories?severity=CRITICAL")
        assert crit_res.status_code == 200
        crit_data = crit_res.json()
        for adv in crit_data["advisories"]:
            assert adv["severity"].upper() == "CRITICAL"

        # 3. Signatures
        sig_res = await client.get("/api/security/signatures")
        assert sig_res.status_code == 200
        sig_data = sig_res.json()
        assert "signatures" in sig_data
        assert "V01" in sig_data["signatures"]


@pytest.mark.asyncio
async def test_academic_records_simulation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. List records
        res = await client.get("/api/academic/records")
        assert res.status_code == 200
        data = res.json()
        assert data["total_matched"] > 0
        student_id = data["students"][0]["id"]

        # 2. Institutional stats
        stats_res = await client.get("/api/academic/stats")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert "overall_average_cgpa" in stats

        # 3. Sync student record with profile
        sync_res = await client.post(f"/api/academic/sync-profile/{student_id}")
        assert sync_res.status_code == 200
        sync_data = sync_res.json()
        assert sync_data["status"] == "success"
        assert "updated_profile" in sync_data
        assert sync_data["updated_profile"]["cgpa"] > 0
        assert "eligibility_recalculation" in sync_data
