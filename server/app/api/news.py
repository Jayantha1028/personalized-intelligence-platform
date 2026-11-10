from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse
import httpx
import trafilatura
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import Article, Source, UserProfile, UserInterest, ArticleFeedback, User
from app.auth.security import get_current_user
from app.ingestion.pipeline import IngestionPipeline
from app.processing.cleaner import extract_clean_article, normalize_url, normalize_title, is_english_content, DEFAULT_HEADERS
from app.processing.deduplicator import check_url_exists, find_or_create_cluster
from app.news_engine.summarizer import HybridSummarizer
from app.news_engine.relevance import calculate_relevance_score

router = APIRouter(prefix="/news")


class ArticleResponse(BaseModel):
    id: int
    source_name: Optional[str] = None
    title: str
    canonical_url: str
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    summary_bullets: List[str]
    personal_impact: Optional[str] = None
    practical_actions: List[str]
    topic: str
    quality_score: float
    relevance_score: float
    is_verified: bool
    created_at: datetime
    user_feedback: Optional[str] = None
    dynamic_relevance: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class ArticleFeedbackRequest(BaseModel):
    feedback: str  # "like", "dislike", "neutral"


class FeedbackSummaryResponse(BaseModel):
    feedbacks: Dict[int, str]
    topic_weights: Dict[str, float]
    total_likes: int
    total_dislikes: int
    boosted_topics: List[str]
    deprioritized_topics: List[str]


class ExtractUrlRequest(BaseModel):
    url: str


class ScrapeUrlRequest(BaseModel):
    url: str
    topic: Optional[str] = "Artificial Intelligence"


class SyncNewsResponse(BaseModel):
    sources_processed: int
    total_new_articles: int
    failed_sources: int
    details: List[Dict[str, Any]]


@router.post("/sync", response_model=SyncNewsResponse)
async def sync_news_feeds(
    max_items: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Trigger on-demand feed fetch across all active news and scheme sources."""
    pipeline = IngestionPipeline()
    result = await pipeline.run_all_sources(db=db, max_items_per_source=max_items)
    return result


@router.post("/extract")
async def extract_url(data: ExtractUrlRequest):
    """Extract clean distraction-free text from any URL using Trafilatura."""
    clean_url = normalize_url(data.url)
    text = await extract_clean_article(clean_url)
    return {
        "url": clean_url,
        "characters_extracted": len(text),
        "preview": text[:500] if text else "",
    }


@router.post("/scrape", response_model=ArticleResponse)
async def scrape_and_ingest_url(
    data: ScrapeUrlRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Live web scraper endpoint: takes ANY article or news URL from the internet,
    scrapes full content with Trafilatura, extracts clean metadata/title,
    generates 3-bullet factual summary, calculates relevance score,
    and adds it to the user's news feed.
    """
    clean_url = normalize_url(data.url)
    if not clean_url:
        raise HTTPException(status_code=400, detail="Invalid URL provided.")

    # 1. Check if already ingested
    existing_stmt = select(Article, Source.name.label("source_name")).join(
        Source, Article.source_id == Source.id, isouter=True
    ).where(Article.canonical_url == clean_url)
    existing_row = (await db.execute(existing_stmt)).first()
    if existing_row:
        art, src_name = existing_row
        return ArticleResponse(
            id=art.id,
            source_name=src_name or "Web Scraper",
            title=art.title,
            canonical_url=art.canonical_url,
            author=art.author,
            published_at=art.published_at,
            summary_bullets=art.summary_bullets or [],
            personal_impact=art.personal_impact,
            practical_actions=art.practical_actions or [],
            topic=art.topic,
            quality_score=art.quality_score,
            relevance_score=art.relevance_score,
            is_verified=art.is_verified,
            created_at=art.created_at,
        )

    # 2. Live HTTP fetch & Trafilatura scrape
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=DEFAULT_HEADERS) as client:
            resp = await client.get(clean_url)
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Web server returned HTTP {resp.status_code}")
            html = resp.text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape webpage: {e}")

    # Extract clean article body and metadata
    extracted_text = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=False,
        no_fallback=False,
        output_format="txt",
    )
    if not extracted_text or len(extracted_text.strip()) < 50:
        raise HTTPException(status_code=422, detail="Could not extract readable article text from this URL.")

    meta = trafilatura.extract_metadata(html)
    raw_title = meta.title if meta and meta.title else urlparse(clean_url).path.split("/")[-1].replace("-", " ")
    clean_title = normalize_title(raw_title) or "Scraped Article"
    author = meta.author if meta and meta.author else "Web Author"

    # 3. Ensure a Web Scraper Source exists
    source_stmt = select(Source).where(Source.slug == "web-scraper-direct")
    source = (await db.execute(source_stmt)).scalars().first()
    if not source:
        source = Source(
            name="Web Scraper (Direct URL)",
            slug="web-scraper-direct",
            category="technology",
            source_type="scraper",
            base_url="https://internet.web",
            country="Global",
            region="Global",
            trust_level="verified",
            fetch_interval_minutes=0,
            last_status="success",
        )
        db.add(source)
        await db.flush()

    # 4. Hybrid Summarizer (local CPU extractive zero-GPU or Gemini)
    summarizer = HybridSummarizer()
    summary_res = await summarizer.summarize(
        title=clean_title,
        content=extracted_text,
    )

    # 5. Load profile context for relevance
    profile_stmt = select(UserProfile)
    profile = (await db.execute(profile_stmt)).scalars().first()
    user_skills = profile.skills if profile and profile.skills else ["Python", "AI", "Cloud"]

    interests_stmt = select(UserInterest)
    interests_rows = (await db.execute(interests_stmt)).scalars().all()
    user_interests = [{"topic": i.topic, "weight": i.weight} for i in interests_rows]

    relevance = calculate_relevance_score(
        title=clean_title,
        content=extracted_text,
        published_at=datetime.now(timezone.utc),
        source_trust_level=source.trust_level,
        user_interests=user_interests,
        user_skills=user_skills,
    )

    # 6. Cluster & save
    topic = data.topic or "Artificial Intelligence"
    cluster_id = await find_or_create_cluster(db, clean_title, topic)

    now = datetime.now(timezone.utc)
    article = Article(
        source_id=source.id,
        cluster_id=cluster_id,
        title=clean_title,
        canonical_url=clean_url,
        author=author,
        published_at=now,
        raw_content=extracted_text[:1500],
        clean_content=extracted_text[:1500],
        summary_bullets=summary_res.summary_bullets,
        personal_impact=summary_res.personal_impact,
        practical_actions=summary_res.practical_actions,
        topic=topic,
        relevance_score=relevance,
        quality_score=0.90,
        is_verified=True,
    )
    db.add(article)
    await db.commit()
    await db.refresh(article)

    return ArticleResponse(
        id=article.id,
        source_name=source.name,
        title=article.title,
        canonical_url=article.canonical_url,
        author=article.author,
        published_at=article.published_at,
        summary_bullets=article.summary_bullets,
        personal_impact=article.personal_impact,
        practical_actions=article.practical_actions,
        topic=article.topic,
        quality_score=article.quality_score,
        relevance_score=article.relevance_score,
        is_verified=article.is_verified,
        created_at=article.created_at,
    )


@router.get("", response_model=List[ArticleResponse])
async def list_news(
    topic: Optional[str] = Query(None, description="Filter by topic (e.g. AI, Cloud, Policy, Cyber)"),
    min_relevance: float = Query(0.0, description="Minimum relevance score (0.0 to 1.0)"),
    limit: int = Query(25, ge=1, le=100, description="Maximum number of articles to return (capped at 25)"),
    offset: int = Query(0, ge=0),
    max_days: Optional[int] = Query(2, ge=1, le=30, description="Maximum age of articles in days (default: 2 days)"),
    sort_by: Optional[str] = Query("relevance", description="Sort order: relevance, date, or quality"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve personalized news feed dynamically tuned by user likes, dislikes, and topic weights. Limited to at most 25 items published within the last 2 days."""
    effective_limit = min(limit, 25)

    # 1. Fetch user feedbacks
    fb_stmt = select(ArticleFeedback).where(ArticleFeedback.user_id == current_user.id)
    fb_rows = (await db.execute(fb_stmt)).scalars().all()
    feedbacks_map = {f.article_id: f.feedback for f in fb_rows}

    # 2. Fetch user topic interest weights
    int_stmt = select(UserInterest).where(UserInterest.user_id == current_user.id)
    int_rows = (await db.execute(int_stmt)).scalars().all()
    weights_map = {i.topic.strip().lower(): i.weight for i in int_rows}

    if sort_by == "date":
        order_clauses = [desc(Article.published_at), desc(Article.relevance_score)]
    elif sort_by == "quality":
        order_clauses = [desc(Article.quality_score), desc(Article.relevance_score)]
    else:
        order_clauses = [desc(Article.relevance_score), desc(Article.published_at)]

    query = select(Article, Source.name.label("source_name")).join(
        Source, Article.source_id == Source.id, isouter=True
    ).order_by(*order_clauses)

    # Filter articles to strictly less than max_days ago (default: 2 days / 48 hours)
    if max_days is not None and max_days > 0:
        cutoff = datetime.now(timezone.utc) - timedelta(days=max_days)
        query = query.where(Article.published_at >= cutoff)

    if topic and topic.lower() != "all":
        query = query.where(Article.topic.ilike(f"%{topic}%"))

    if min_relevance > 0:
        query = query.where(Article.relevance_score >= min_relevance)

    # Fetch enough candidates to dynamically sort and return up to effective_limit
    query = query.offset(offset).limit(max(effective_limit * 2, 50))
    result = await db.execute(query)
    rows = result.all()

    articles = []
    for article, source_name in rows:
        if not is_english_content(article.title):
            continue

        if max_days is not None and max_days > 0 and article.published_at:
            pub = article.published_at if article.published_at.tzinfo else article.published_at.replace(tzinfo=timezone.utc)
            if pub < cutoff:
                continue

        user_fb = feedbacks_map.get(article.id)
        topic_key = (article.topic or "").strip().lower()
        topic_multiplier = weights_map.get(topic_key, 1.0)

        # Dynamic relevance score calculation
        dyn_score = article.relevance_score * topic_multiplier
        if user_fb == "like":
            dyn_score += 0.20
        elif user_fb == "dislike":
            dyn_score -= 0.50

        dyn_score = round(min(1.0, max(0.05, dyn_score)), 2)

        articles.append(
            ArticleResponse(
                id=article.id,
                source_name=source_name or "Official Feed",
                title=article.title,
                canonical_url=article.canonical_url,
                author=article.author,
                published_at=article.published_at,
                summary_bullets=article.summary_bullets or [],
                personal_impact=article.personal_impact,
                practical_actions=article.practical_actions or [],
                topic=article.topic,
                quality_score=article.quality_score,
                relevance_score=article.relevance_score,
                is_verified=article.is_verified,
                created_at=article.created_at,
                user_feedback=user_fb,
                dynamic_relevance=dyn_score,
            )
        )

    # If sorted by relevance, dynamically sort with user feedback and topic weights
    if sort_by == "relevance":
        articles.sort(key=lambda a: (a.dynamic_relevance or 0.0, a.relevance_score), reverse=True)

    return articles[:effective_limit]


@router.post("/{article_id}/feedback")
async def record_article_feedback(
    article_id: int,
    data: ArticleFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Like or dislike an article to dynamically adjust personal feed recommendations."""
    action = data.feedback.lower()
    if action not in ["like", "dislike", "neutral"]:
        raise HTTPException(status_code=400, detail="Feedback must be 'like', 'dislike', or 'neutral'")

    # 1. Verify article exists
    art_stmt = select(Article).where(Article.id == article_id)
    art_res = await db.execute(art_stmt)
    article = art_res.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # 2. Upsert feedback record
    fb_stmt = select(ArticleFeedback).where(
        ArticleFeedback.user_id == current_user.id,
        ArticleFeedback.article_id == article_id,
    )
    fb_res = await db.execute(fb_stmt)
    fb = fb_res.scalars().first()

    if action == "neutral":
        if fb:
            await db.delete(fb)
    else:
        if fb:
            fb.feedback = action
        else:
            fb = ArticleFeedback(
                user_id=current_user.id,
                article_id=article_id,
                feedback=action,
            )
            db.add(fb)

    # 3. Dynamically adjust user interest weight for this topic
    topic_clean = (article.topic or "Technology").strip()
    interest_stmt = select(UserInterest).where(
        UserInterest.user_id == current_user.id,
        UserInterest.topic.ilike(topic_clean),
    )
    interest_res = await db.execute(interest_stmt)
    user_interest = interest_res.scalars().first()

    base_weight = user_interest.weight if user_interest else 1.0
    if action == "like":
        new_weight = min(2.5, round(base_weight + 0.25, 2))
    elif action == "dislike":
        new_weight = max(0.15, round(base_weight - 0.35, 2))
    else:  # neutral
        new_weight = 1.0

    if user_interest:
        user_interest.weight = new_weight
    else:
        user_interest = UserInterest(
            user_id=current_user.id,
            topic=topic_clean,
            weight=new_weight,
        )
        db.add(user_interest)

    await db.commit()

    # Fetch all user topic weights for dynamic response
    all_interests_stmt = select(UserInterest).where(UserInterest.user_id == current_user.id)
    all_interests = (await db.execute(all_interests_stmt)).scalars().all()
    topic_weights = {i.topic: round(i.weight, 2) for i in all_interests}

    return {
        "article_id": article_id,
        "feedback": action if action != "neutral" else None,
        "topic": topic_clean,
        "topic_weight": new_weight,
        "active_weights": topic_weights,
        "message": f"Feed updated: {topic_clean} is now boosted to {new_weight}x"
        if action == "like"
        else (f"Feed updated: {topic_clean} de-prioritized to {new_weight}x" if action == "dislike" else "Feedback reset"),
    }


@router.get("/feedback/summary", response_model=FeedbackSummaryResponse)
async def get_feedback_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all liked and disliked articles and active topic affinity weights."""
    fb_stmt = select(ArticleFeedback).where(ArticleFeedback.user_id == current_user.id)
    feedbacks_rows = (await db.execute(fb_stmt)).scalars().all()
    feedbacks_map = {f.article_id: f.feedback for f in feedbacks_rows}

    int_stmt = select(UserInterest).where(UserInterest.user_id == current_user.id)
    interest_rows = (await db.execute(int_stmt)).scalars().all()
    weights_map = {i.topic: round(i.weight, 2) for i in interest_rows}

    total_likes = sum(1 for v in feedbacks_map.values() if v == "like")
    total_dislikes = sum(1 for v in feedbacks_map.values() if v == "dislike")
    boosted = [t for t, w in weights_map.items() if w > 1.0]
    deprioritized = [t for t, w in weights_map.items() if w < 1.0]

    return FeedbackSummaryResponse(
        feedbacks=feedbacks_map,
        topic_weights=weights_map,
        total_likes=total_likes,
        total_dislikes=total_dislikes,
        boosted_topics=boosted,
        deprioritized_topics=deprioritized,
    )


@router.post("/feedback/reset")
async def reset_feed_tuning(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reset all like/dislike feedback and restore baseline topic weights."""
    del_fb = select(ArticleFeedback).where(ArticleFeedback.user_id == current_user.id)
    fb_rows = (await db.execute(del_fb)).scalars().all()
    for f in fb_rows:
        await db.delete(f)

    del_int = select(UserInterest).where(UserInterest.user_id == current_user.id)
    int_rows = (await db.execute(del_int)).scalars().all()
    for i in int_rows:
        i.weight = 1.0

    await db.commit()
    return {"message": "Feed tuning reset to baseline default."}


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve single article detail with full grounding and action points."""
    query = select(Article, Source.name.label("source_name")).join(
        Source, Article.source_id == Source.id, isouter=True
    ).where(Article.id == article_id)

    result = await db.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Article not found")

    article, source_name = row
    return ArticleResponse(
        id=article.id,
        source_name=source_name or "Official Feed",
        title=article.title,
        canonical_url=article.canonical_url,
        author=article.author,
        published_at=article.published_at,
        summary_bullets=article.summary_bullets or [],
        personal_impact=article.personal_impact,
        practical_actions=article.practical_actions or [],
        topic=article.topic,
        quality_score=article.quality_score,
        relevance_score=article.relevance_score,
        is_verified=article.is_verified,
        created_at=article.created_at,
    )
