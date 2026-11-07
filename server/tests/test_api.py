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
async def test_article_feedback_and_feed_tuning():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get first article
        res = await ac.get("/api/news")
        articles = res.json()
        assert len(articles) > 0
        art_id = articles[0]["id"]

        # Like the article
        like_resp = await ac.post(f"/api/news/{art_id}/feedback", json={"feedback": "like"})
        assert like_resp.status_code == 200
        like_data = like_resp.json()
        assert like_data["feedback"] == "like"
        assert "topic_weight" in like_data

        # Check feedback summary
        summary_resp = await ac.get("/api/news/feedback/summary")
        assert summary_resp.status_code == 200
        summary_data = summary_resp.json()
        assert summary_data["total_likes"] >= 1
        assert str(art_id) in summary_data["feedbacks"] or art_id in summary_data["feedbacks"]

        # Dislike the article
        dislike_resp = await ac.post(f"/api/news/{art_id}/feedback", json={"feedback": "dislike"})
        assert dislike_resp.status_code == 200
        assert dislike_resp.json()["feedback"] == "dislike"



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
