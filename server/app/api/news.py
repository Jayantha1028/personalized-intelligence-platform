from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from urllib.parse import urlparse
import httpx
import trafilatura
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import Article, Source, UserProfile, UserInterest
from app.ingestion.pipeline import IngestionPipeline
from app.processing.cleaner import extract_clean_article, normalize_url, normalize_title, DEFAULT_HEADERS
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

    model_config = ConfigDict(from_attributes=True)


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
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve personalized news feed sorted by relevance and publication date."""
    query = select(Article, Source.name.label("source_name")).join(
        Source, Article.source_id == Source.id, isouter=True
    ).order_by(desc(Article.relevance_score), desc(Article.published_at))

    if topic and topic.lower() != "all":
        query = query.where(Article.topic.ilike(f"%{topic}%"))

    if min_relevance > 0:
        query = query.where(Article.relevance_score >= min_relevance)

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    articles = []
    for article, source_name in rows:
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
            )
        )
    return articles


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
