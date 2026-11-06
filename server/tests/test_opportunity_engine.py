import pytest
from datetime import datetime, timezone, timedelta
from app.database.models import UserProfile, Opportunity
from app.opportunity_engine.eligibility_matcher import evaluate_eligibility


def make_profile(
    education_level="undergraduate",
    state="Karnataka",
    academic_year=3,
    annual_income=400000.0,
    course="B.Tech Computer Science",
    skills=None,
):
    profile = UserProfile(
        id=1,
        user_id=1,
        country="India",
        state=state,
        education_level=education_level,
        course_or_degree=course,
        academic_year=academic_year,
        annual_income=annual_income,
        skills=skills or ["Python", "FastAPI", "Cloud"],
    )
    return profile


def test_matched_eligibility():
    profile = make_profile(education_level="undergraduate", annual_income=300000, state="Karnataka")
    opp = Opportunity(
        title="Merit-cum-Means National Scholarship",
        category="scholarship",
        provider="Ministry of Education",
        country="India",
        region="National",
        description="National financial assistance for undergraduate students.",
        benefit_type="financial",
        benefit_amount=25000,
        eligibility_rules={
            "education_level": ["undergraduate"],
            "income_limit": 450000,
            "allowed_regions": ["National", "All"],
        },
        application_deadline=datetime.now(timezone.utc) + timedelta(days=20),
        official_url="https://scholarships.gov.in",
        verification_status="officially_verified",
        status="open",
    )

    result = evaluate_eligibility(profile, opp)
    assert result.match_status == "MATCHED"
    assert result.fit_score >= 0.80
    assert len(result.failed_criteria) == 0
    assert len(result.passed_criteria) >= 2


def test_failed_income_ceiling():
    profile = make_profile(annual_income=600000)
    opp = Opportunity(
        title="Low Income Assistance Grant",
        category="scholarship",
        provider="Foundation",
        description="Grants for families with income below 2.5L",
        eligibility_rules={"income_limit": 250000},
        official_url="https://example.org",
        verification_status="officially_verified",
    )

    result = evaluate_eligibility(profile, opp)
    assert result.match_status == "NOT_ELIGIBLE"
    assert any("exceeds" in f for f in result.failed_criteria)
    assert result.fit_score < 0.50


def test_state_domicile_restriction():
    profile = make_profile(state="Karnataka")
    opp = Opportunity(
        title="Maharashtra State Post-Matric Concession",
        category="government_scheme",
        provider="Government of Maharashtra",
        description="Exclusively for Maharashtra residents.",
        eligibility_rules={"state": "Maharashtra"},
        official_url="https://mahadbt.maharashtra.gov.in",
        verification_status="officially_verified",
    )

    result = evaluate_eligibility(profile, opp)
    assert result.match_status == "NOT_ELIGIBLE"
    assert any("Restricted to Maharashtra" in f for f in result.failed_criteria)


def test_missing_data_is_never_treated_as_pass():
    # Profile with missing annual income
    profile = make_profile(annual_income=None)
    opp = Opportunity(
        title="Need-based Scholarship",
        category="scholarship",
        provider="CSR Trust",
        description="Needs income verification.",
        eligibility_rules={
            "education_level": ["undergraduate"],
            "income_limit": 300000,
        },
        official_url="https://example.org",
        verification_status="officially_verified",
    )

    result = evaluate_eligibility(profile, opp)
    # Crucial rule from Section 10: missing income must NEVER result in MATCHED
    assert result.match_status != "MATCHED"
    assert result.match_status == "POTENTIALLY_ELIGIBLE"
    assert any("income" in u.lower() for u in result.unknown_criteria)


def test_academic_year_requirement():
    profile_y1 = make_profile(academic_year=1)
    profile_y3 = make_profile(academic_year=3)
    opp = Opportunity(
        title="Advanced AI Summer Internship",
        category="career",
        provider="Tech Foundation",
        description="Requires 2nd year or above.",
        eligibility_rules={"min_academic_year": 2},
        official_url="https://example.org",
        verification_status="officially_verified",
    )

    res_y1 = evaluate_eligibility(profile_y1, opp)
    assert res_y1.match_status == "NOT_ELIGIBLE"

    res_y3 = evaluate_eligibility(profile_y3, opp)
    assert res_y3.match_status == "MATCHED"
