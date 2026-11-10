from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from pydantic import BaseModel
from typing import List, Optional
from app.database.session import get_db
from app.database.models import Article, Opportunity, OpportunityMatch, Source

router = APIRouter(prefix="/dashboard")


class DeadlineItem(BaseModel):
    id: int
    title: str
    provider: str
    category: str
    deadline: datetime
    official_url: str
    status: str


class DashboardStats(BaseModel):
    total_articles: int
    high_relevance_articles: int
    total_opportunities: int
    matched_opportunities: int
    potential_matches: int
    upcoming_deadlines_count: int
    active_sources_count: int
    upcoming_deadlines: List[DeadlineItem]


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Summary metrics and upcoming deadlines for the user's dashboard widgets."""
    now = datetime.now(timezone.utc)
    cutoff_48h = now - timedelta(days=2)

    # 1. Total & High relevance articles (within last 2 days, capped at 25)
    art_count_q = select(func.count(Article.id)).where(Article.published_at >= cutoff_48h)
    recent_articles = (await db.execute(art_count_q)).scalar() or 0
    total_articles = min(25, recent_articles)

    high_rel_q = select(func.count(Article.id)).where(
        and_(Article.published_at >= cutoff_48h, Article.relevance_score >= 0.8)
    )
    high_relevance_articles = min(total_articles, (await db.execute(high_rel_q)).scalar() or 0)

    # 2. Total opportunities
    opp_count_q = select(func.count(Opportunity.id))
    total_opportunities = (await db.execute(opp_count_q)).scalar() or 0

    # 3. Matches
    matched_q = select(func.count(OpportunityMatch.id)).where(OpportunityMatch.match_status == "MATCHED")
    matched_opportunities = (await db.execute(matched_q)).scalar() or 0

    potential_q = select(func.count(OpportunityMatch.id)).where(OpportunityMatch.match_status == "POTENTIALLY_ELIGIBLE")
    potential_matches = (await db.execute(potential_q)).scalar() or 0

    # 4. Active sources
    src_count_q = select(func.count(Source.id)).where(Source.enabled == True)
    active_sources_count = (await db.execute(src_count_q)).scalar() or 0

    # 5. Upcoming deadlines
    deadline_q = (
        select(Opportunity)
        .where(
            and_(
                Opportunity.application_deadline != None,
                Opportunity.application_deadline >= now,
                Opportunity.status == "open",
            )
        )
        .order_by(Opportunity.application_deadline)
        .limit(5)
    )
    deadline_rows = (await db.execute(deadline_q)).scalars().all()

    upcoming_deadlines = [
        DeadlineItem(
            id=opp.id,
            title=opp.title,
            provider=opp.provider,
            category=opp.category,
            deadline=opp.application_deadline,
            official_url=opp.official_url,
            status=opp.status,
        )
        for opp in deadline_rows
    ]

    return DashboardStats(
        total_articles=total_articles,
        high_relevance_articles=high_relevance_articles,
        total_opportunities=total_opportunities,
        matched_opportunities=matched_opportunities,
        potential_matches=potential_matches,
        upcoming_deadlines_count=len(upcoming_deadlines),
        active_sources_count=active_sources_count,
        upcoming_deadlines=upcoming_deadlines,
    )
