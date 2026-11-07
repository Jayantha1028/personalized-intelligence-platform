import time
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Source, SourceRun, Article, UserProfile, UserInterest
from app.ingestion.rss_fetcher import RSSFetcher
from app.processing.cleaner import normalize_url, normalize_title, extract_clean_article, is_english_content
from app.processing.deduplicator import check_url_exists, find_or_create_cluster
from app.news_engine.summarizer import HybridSummarizer
from app.news_engine.relevance import calculate_relevance_score


class IngestionPipeline:
    def __init__(self):
        self.fetcher = RSSFetcher(timeout_seconds=15.0)
        self.summarizer = HybridSummarizer()

    async def run_all_sources(self, db: AsyncSession, max_items_per_source: int = 5) -> Dict[str, Any]:
        """
        Run ingestion across all enabled sources with feed URLs.
        Provides strict error isolation: failure in one source does not crash others.
        """
        stmt = select(Source).where(Source.enabled == True, Source.feed_url != None)
        sources = (await db.execute(stmt)).scalars().all()

        # Load profile context for relevance
        profile_stmt = select(UserProfile)
        profile = (await db.execute(profile_stmt)).scalars().first()
        user_skills = profile.skills if profile and profile.skills else ["Python", "AI", "Cloud"]

        interests_stmt = select(UserInterest)
        interests_rows = (await db.execute(interests_stmt)).scalars().all()
        user_interests = [{"topic": i.topic, "weight": i.weight} for i in interests_rows]

        summary_metrics = {
            "sources_processed": len(sources),
            "total_new_articles": 0,
            "failed_sources": 0,
            "details": [],
        }

        for source in sources:
            source_detail = await self.process_source(
                db=db,
                source=source,
                user_interests=user_interests,
                user_skills=user_skills,
                max_items=max_items_per_source,
            )
            summary_metrics["details"].append(source_detail)
            summary_metrics["total_new_articles"] += source_detail["new_items"]
            if source_detail["status"] == "error":
                summary_metrics["failed_sources"] += 1

        return summary_metrics

    async def process_source(
        self,
        db: AsyncSession,
        source: Source,
        user_interests: List[Dict[str, float]],
        user_skills: List[str],
        max_items: int = 5,
    ) -> Dict[str, Any]:
        """Process a single source independently."""
        start_time = time.time()
        new_items = 0
        error_msg = None
        status = "success"

        try:
            if not source.feed_url:
                raise ValueError("No feed URL specified")

            entries = await self.fetcher.fetch_feed(source.feed_url)
            for entry in entries[:max_items]:
                clean_url = normalize_url(entry["url"])
                clean_title = normalize_title(entry["title"])

                # Skip non-English / Hindi news items
                if not is_english_content(clean_title):
                    continue

                # 1. Deduplication check
                if await check_url_exists(db, clean_url):
                    continue

                # 2. Extract article body
                clean_content = await extract_clean_article(
                    url=clean_url, fallback_text=entry.get("raw_summary", "")
                )

                # 3. Deduplicate / cluster stories
                topic = source.name.split()[0] if source.name else "Technology"
                cluster_id = await find_or_create_cluster(db, clean_title, topic)

                # 4. Summarize (Hybrid: CPU Extractive or Gemini Flash)
                summary_res = await self.summarizer.summarize(
                    title=clean_title,
                    content=clean_content or clean_title,
                )

                # 5. Score relevance
                relevance = calculate_relevance_score(
                    title=clean_title,
                    content=clean_content or "",
                    published_at=entry.get("published_at"),
                    source_trust_level=source.trust_level,
                    user_interests=user_interests,
                    user_skills=user_skills,
                )

                # 6. Save article
                article = Article(
                    source_id=source.id,
                    cluster_id=cluster_id,
                    title=clean_title,
                    canonical_url=clean_url,
                    author=entry.get("author"),
                    published_at=entry.get("published_at"),
                    raw_content=clean_content[:1500] if clean_content else None,
                    clean_content=clean_content[:1500] if clean_content else None,
                    summary_bullets=summary_res.summary_bullets,
                    personal_impact=summary_res.personal_impact,
                    practical_actions=summary_res.practical_actions,
                    topic=topic,
                    relevance_score=relevance,
                    quality_score=0.88,
                    is_verified=True,
                )
                db.add(article)
                new_items += 1

            source.last_fetched_at = datetime.now(timezone.utc)
            source.last_status = "success"
            source.failure_count = 0

        except Exception as e:
            status = "error"
            error_msg = str(e)
            source.last_status = "error"
            source.failure_count += 1

        duration_ms = int((time.time() - start_time) * 1000)

        # Log SourceRun
        run = SourceRun(
            source_id=source.id,
            status=status,
            items_found=len(entries) if "entries" in locals() else 0,
            items_created=new_items,
            error_message=error_msg,
            duration_ms=duration_ms,
        )
        db.add(run)
        await db.commit()

        return {
            "source_id": source.id,
            "source_name": source.name,
            "status": status,
            "new_items": new_items,
            "duration_ms": duration_ms,
            "error": error_msg,
        }
