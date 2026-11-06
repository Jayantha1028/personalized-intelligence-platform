import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["database"] == "healthy"
        assert "version" in data


@pytest.mark.asyncio
async def test_dashboard_stats():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_articles"] >= 3
        assert data["total_opportunities"] >= 4
        assert data["matched_opportunities"] >= 1
        assert "upcoming_deadlines" in data


@pytest.mark.asyncio
async def test_news_listing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/news")
        assert response.status_code == 200
        articles = response.json()
        assert len(articles) > 0
        first = articles[0]
        assert "title" in first
        assert "summary_bullets" in first
        assert "relevance_score" in first
        assert "personal_impact" in first


@pytest.mark.asyncio
async def test_opportunities_listing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/opportunities")
        assert response.status_code == 200
        opps = response.json()
        assert len(opps) > 0
        first = opps[0]
        assert "title" in first
        assert "provider" in first
        assert "match_status" in first
        assert "eligibility_rules" in first


@pytest.mark.asyncio
async def test_profile_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/profile")
        assert response.status_code == 200
        profile = response.json()
        assert profile["country"] == "India"
        assert profile["education_level"] == "undergraduate"
