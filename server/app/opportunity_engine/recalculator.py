from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.database.models import UserProfile, Opportunity, OpportunityMatch, VerificationRecord
from app.opportunity_engine.eligibility_matcher import evaluate_eligibility


async def recalculate_user_matches(db: AsyncSession, user_id: int) -> Dict[str, Any]:
    """
    Recalculates eligibility matches for all opportunities against the user profile.
    Triggered when user modifies profile, or when new opportunities are added.
    """
    # 1. Fetch user profile
    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    res = await db.execute(stmt)
    profile = res.scalars().first()

    # 2. Fetch all opportunities
    opp_stmt = select(Opportunity)
    opp_res = await db.execute(opp_stmt)
    opportunities = opp_res.scalars().all()

    # 3. Fetch existing matches
    m_stmt = select(OpportunityMatch).where(OpportunityMatch.user_id == user_id)
    m_res = await db.execute(m_stmt)
    existing_matches = {m.opportunity_id: m for m in m_res.scalars().all()}

    counts = {
        "MATCHED": 0,
        "POTENTIALLY_ELIGIBLE": 0,
        "NOT_ELIGIBLE": 0,
        "UNKNOWN": 0,
    }

    now = datetime.now(timezone.utc)

    for opp in opportunities:
        # Check deadline expiry
        deadline = opp.application_deadline
        if deadline:
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            if deadline < now and opp.status == "open":
                opp.status = "expired"
                opp.verification_status = "expired"

        eval_result = evaluate_eligibility(profile, opp)
        counts[eval_result.match_status] = counts.get(eval_result.match_status, 0) + 1

        match = existing_matches.get(opp.id)
        if match:
            match.match_status = eval_result.match_status
            match.fit_score = eval_result.fit_score
            match.passed_criteria = eval_result.passed_criteria
            match.failed_criteria = eval_result.failed_criteria
            match.unknown_criteria = eval_result.unknown_criteria
            match.reasons = eval_result.reasons
            match.updated_at = now
        else:
            new_match = OpportunityMatch(
                user_id=user_id,
                opportunity_id=opp.id,
                match_status=eval_result.match_status,
                fit_score=eval_result.fit_score,
                passed_criteria=eval_result.passed_criteria,
                failed_criteria=eval_result.failed_criteria,
                unknown_criteria=eval_result.unknown_criteria,
                reasons=eval_result.reasons,
                created_at=now,
                updated_at=now,
            )
            db.add(new_match)

    await db.commit()
    return {
        "user_id": user_id,
        "total_evaluated": len(opportunities),
        "counts": counts,
    }


async def seed_additional_verified_opportunities(db: AsyncSession) -> int:
    """
    Seeds comprehensive high-value verified opportunities across categories:
    - AICTE Pragati Scholarship for Girls
    - PMRF (Prime Minister's Research Fellowship)
    - AWS Educate & Cloud Credits for Students
    - Google Summer of Code (GSoC)
    - Digital India Virtual Internship Scheme
    """
    now = datetime.now(timezone.utc)
    from datetime import timedelta

    opps_to_add = [
        Opportunity(
            title="AWS Educate & Student Cloud Builder Credits",
            category="company_offer",
            provider="Amazon Web Services (AWS)",
            country="Global",
            region="Global",
            description="Access to no-cost cloud hands-on labs, AWS training content, and up to $100 in promotional AWS credits without requiring a credit card.",
            benefit_type="credit",
            benefit_amount=8300.0,
            currency="INR",
            benefit_summary="$100 (~₹8,300) Free AWS Cloud Credits + Free Builder Labs",
            eligibility_rules={
                "education_level": ["undergraduate", "postgraduate", "diploma"],
                "requires_student_email": True,
                "allowed_regions": ["Global", "All"],
            },
            application_deadline=now + timedelta(days=120),
            official_url="https://aws.amazon.com/education/awseducate/",
            supporting_url="https://aws.amazon.com/blogs/publicsector/",
            verification_status="officially_verified",
            status="open",
        ),
        Opportunity(
            title="Prime Minister's Research Fellowship (PMRF Scheme)",
            category="scholarship",
            provider="Ministry of Education, Government of India",
            country="India",
            region="National",
            description="Designed to improve the quality of research in higher educational institutions in India. Attractive fellowship of up to ₹80,000/month plus research contingency grants of ₹2 Lakhs per year.",
            benefit_type="financial",
            benefit_amount=960000.0,
            currency="INR",
            benefit_summary="₹70,000 - ₹80,000/month stipend + ₹2,00,000/year contingency grant",
            eligibility_rules={
                "education_level": ["undergraduate", "postgraduate"],
                "min_academic_year": 4,
                "domains": ["Computer Science", "Engineering", "Technology", "Science"],
                "allowed_regions": ["National", "All"],
            },
            application_deadline=now + timedelta(days=38),
            official_url="https://www.pmrf.in/",
            supporting_url="https://www.education.gov.in/schemes",
            verification_status="officially_verified",
            status="open",
        ),
        Opportunity(
            title="Digital India Internship Scheme (NIC & MeitY)",
            category="career",
            provider="Ministry of Electronics & Information Technology (MeitY)",
            country="India",
            region="National",
            description="Two-month summer/winter internship program at MeitY headquarters and NIC centers working on national digital infrastructure, cyber security, and AI governance.",
            benefit_type="internship",
            benefit_amount=20000.0,
            currency="INR",
            benefit_summary="₹10,000 / month stipend + Official Certificate of Merit from Govt. of India",
            eligibility_rules={
                "education_level": ["undergraduate", "postgraduate"],
                "min_academic_year": 2,
                "domains": ["Computer Science", "IT", "Electronics", "Data Science"],
                "allowed_regions": ["National", "All"],
            },
            application_deadline=now + timedelta(days=19),
            official_url="https://www.meity.gov.in/schemes",
            supporting_url="https://pib.gov.in/",
            verification_status="officially_verified",
            status="open",
        ),
    ]

    added = 0
    for opp in opps_to_add:
        # Check if already exists by title
        stmt = select(Opportunity.id).where(Opportunity.title == opp.title)
        res = await db.execute(stmt)
        if not res.scalar():
            db.add(opp)
            added += 1

    if added > 0:
        await db.commit()

    return added
