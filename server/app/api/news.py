from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import Article, Source
from app.ingestion.pipeline import IngestionPipeline
from app.processing.cleaner import extract_clean_article, normalize_url

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
