import pytest
from datetime import datetime, timezone, timedelta
from app.processing.cleaner import normalize_url, normalize_title
from app.processing.deduplicator import title_jaccard_similarity
from app.news_engine.summarizer import HybridSummarizer
from app.news_engine.relevance import calculate_relevance_score


def test_normalize_url():
    url = "https://techcrunch.com/2026/03/ai-update/?utm_source=twitter&utm_medium=social&ref=123#comments"
    clean = normalize_url(url)
    assert clean == "https://techcrunch.com/2026/03/ai-update"
    assert "utm_source" not in clean
    assert "comments" not in clean


def test_normalize_title():
    t1 = "India Approves 3 Semiconductor Plants - TechCrunch"
    t2 = "Ministry of Education Announces New Guidelines | PIB"
    assert normalize_title(t1) == "India Approves 3 Semiconductor Plants"
    assert normalize_title(t2) == "Ministry of Education Announces New Guidelines"


def test_deduplicator_jaccard():
    t1 = "OpenAI releases new lightweight on-device AI model"
    t2 = "OpenAI releases lightweight on-device AI models for developers"
    sim = title_jaccard_similarity(t1, t2)
    assert sim >= 0.60

    t3 = "Stock market closes lower amid inflation concerns"
    assert title_jaccard_similarity(t1, t3) < 0.15


@pytest.mark.asyncio
async def test_extractive_summarizer_zero_hallucination():
    summarizer = HybridSummarizer()
    content = (
        "The Cabinet Committee on Economic Affairs today approved an outlay of ₹1,26,000 crore for semiconductor fabrication. "
        "The plants will be established in Gujarat and Assam with commercial production scheduled within 36 months. "
        "Over 20,000 direct technology and electronics engineering jobs will be created nationwide. "
        "All interested students and graduates can check the AICTE internship portal for upcoming training tracks."
    )
    title = "India Approves ₹1.26 Lakh Crore Semiconductor Mission"

    result = await summarizer.summarize(title=title, content=content)
    assert len(result.summary_bullets) == 3
    assert any("₹1,26,000 crore" in b for b in result.summary_bullets)
    assert result.personal_impact is not None
    assert len(result.practical_actions) >= 1
    assert result.is_llm_generated is False  # CPU extractive path verified!


def test_relevance_scoring_formula():
    interests = [{"topic": "Artificial Intelligence", "weight": 1.0}]
    skills = ["Python", "FastAPI"]
    now = datetime.now(timezone.utc)

    # Highly relevant article
    score_high = calculate_relevance_score(
        title="New Artificial Intelligence Tools Released for Python Developers",
        content="This update adds native Python and FastAPI bindings for local AI pipelines.",
        published_at=now,
        source_trust_level="official",
        user_interests=interests,
        user_skills=skills,
    )
    assert 0.7 <= score_high <= 1.0

    # Low relevance article
    score_low = calculate_relevance_score(
        title="Local Gardening Techniques in Southern Europe",
        content="Planting tomatoes and olive trees during springtime.",
        published_at=now - timedelta(days=10),
        source_trust_level="aggregator",
        user_interests=interests,
        user_skills=skills,
    )
    assert score_low < 0.5
