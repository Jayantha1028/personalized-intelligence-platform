from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import Opportunity, OpportunityMatch, UserProfile

router = APIRouter(prefix="/opportunities")


class OpportunityResponse(BaseModel):
    id: int
    title: str
    category: str
    provider: str
    country: str
    region: str
    description: str
    benefit_type: str
    benefit_amount: Optional[float] = None
    currency: Optional[str] = "INR"
    benefit_summary: Optional[str] = None
    eligibility_rules: Dict[str, Any]
    application_deadline: Optional[datetime] = None
    official_url: str
    supporting_url: Optional[str] = None
    verification_status: str
    status: str
    match_status: Optional[str] = "UNKNOWN"
    fit_score: Optional[float] = 0.5
    reasons: Optional[List[str]] = []
    missing_criteria: Optional[List[str]] = []

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[OpportunityResponse])
async def list_opportunities(
    category: Optional[str] = Query(None, description="Category filter (scholarship, government_scheme, company_offer, career)"),
    status: Optional[str] = Query("open", description="Status filter (open, all, upcoming, closed)"),
    match_status: Optional[str] = Query(None, description="Filter by match status (MATCHED, POTENTIALLY_ELIGIBLE, etc)"),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve normalized opportunities with profile fit evaluation."""
    # First get user profile to check matches
    profile_stmt = select(UserProfile)
    p_res = await db.execute(profile_stmt)
    profile = p_res.scalars().first()

    query = select(Opportunity).order_by(desc(Opportunity.created_at))

    if category and category.lower() != "all":
        query = query.where(Opportunity.category == category)

    if status and status.lower() != "all":
        query = query.where(Opportunity.status == status)

    query = query.offset(offset).limit(limit)
    res = await db.execute(query)
    opportunities = res.scalars().all()

    # Fetch existing matches for the user if profile exists
    matches_map = {}
    if profile:
        m_stmt = select(OpportunityMatch).where(OpportunityMatch.user_id == profile.user_id)
        m_res = await db.execute(m_stmt)
        for m in m_res.scalars().all():
            matches_map[m.opportunity_id] = m

    items = []
    for opp in opportunities:
        match = matches_map.get(opp.id)
        current_match_status = match.match_status if match else "UNKNOWN"
        fit_score = match.fit_score if match else 0.5
        reasons = match.reasons if match else []
        unknown_crit = match.unknown_criteria if match else []

        if match_status and match_status.upper() != "ALL" and current_match_status != match_status.upper():
            continue

        items.append(
            OpportunityResponse(
                id=opp.id,
                title=opp.title,
                category=opp.category,
                provider=opp.provider,
                country=opp.country,
                region=opp.region,
                description=opp.description,
                benefit_type=opp.benefit_type,
                benefit_amount=opp.benefit_amount,
                currency=opp.currency,
                benefit_summary=opp.benefit_summary,
                eligibility_rules=opp.eligibility_rules or {},
                application_deadline=opp.application_deadline,
                official_url=opp.official_url,
                supporting_url=opp.supporting_url,
                verification_status=opp.verification_status,
                status=opp.status,
                match_status=current_match_status,
                fit_score=fit_score,
                reasons=reasons or [],
                missing_criteria=unknown_crit or [],
            )
        )

    return items


@router.get("/{opp_id}", response_model=OpportunityResponse)
async def get_opportunity(opp_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve full opportunity detail, official source link, and detailed matching criteria breakdown."""
    stmt = select(Opportunity).where(Opportunity.id == opp_id)
    res = await db.execute(stmt)
    opp = res.scalars().first()

    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    m_stmt = select(OpportunityMatch).where(OpportunityMatch.opportunity_id == opp_id)
    m_res = await db.execute(m_stmt)
    match = m_res.scalars().first()

    return OpportunityResponse(
        id=opp.id,
        title=opp.title,
        category=opp.category,
        provider=opp.provider,
        country=opp.country,
        region=opp.region,
        description=opp.description,
        benefit_type=opp.benefit_type,
        benefit_amount=opp.benefit_amount,
        currency=opp.currency,
        benefit_summary=opp.benefit_summary,
        eligibility_rules=opp.eligibility_rules or {},
        application_deadline=opp.application_deadline,
        official_url=opp.official_url,
        supporting_url=opp.supporting_url,
        verification_status=opp.verification_status,
        status=opp.status,
        match_status=match.match_status if match else "UNKNOWN",
        fit_score=match.fit_score if match else 0.5,
        reasons=match.reasons if match else [],
        missing_criteria=match.unknown_criteria if match else [],
    )
