from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import math
from app.database.models import UserProfile, Opportunity


class MatchEvaluationResult:
    def __init__(
        self,
        match_status: str,  # MATCHED, POTENTIALLY_ELIGIBLE, NOT_ELIGIBLE, UNKNOWN
        fit_score: float,
        passed_criteria: List[str],
        failed_criteria: List[str],
        unknown_criteria: List[str],
        reasons: List[str],
    ):
        self.match_status = match_status
        self.fit_score = fit_score
        self.passed_criteria = passed_criteria
        self.failed_criteria = failed_criteria
        self.unknown_criteria = unknown_criteria
        self.reasons = reasons


def evaluate_eligibility(
    profile: Optional[UserProfile],
    opportunity: Opportunity,
) -> MatchEvaluationResult:
    """
    Deterministic eligibility evaluator strictly implementing Section 10 of the build plan.
    Evaluates:
      1. Education level
      2. Income ceiling limits
      3. State and regional domicile
      4. Academic year and semester
      5. Degree domains & specialization keywords
      6. Student enrollment prerequisites
    Missing information is never treated as passed.
    """
    rules = opportunity.eligibility_rules or {}
    passed: List[str] = []
    failed: List[str] = []
    unknown: List[str] = []
    reasons: List[str] = []

    # If no profile exists at all, everything is UNKNOWN
    if not profile:
        return MatchEvaluationResult(
            match_status="UNKNOWN",
            fit_score=0.3,
            passed_criteria=[],
            failed_criteria=[],
            unknown_criteria=["User profile not configured."],
            reasons=["Configure your academic and regional profile to calculate verified eligibility."],
        )

    # 1. Education Level Check
    allowed_edu = rules.get("education_level") or rules.get("allowed_education_levels")
    if allowed_edu:
        if isinstance(allowed_edu, str):
            allowed_edu = [allowed_edu]
        allowed_edu_lower = [e.lower() for e in allowed_edu]

        if not profile.education_level:
            unknown.append("Education level missing in your profile")
        elif profile.education_level.lower() in allowed_edu_lower:
            passed.append(f"Education: {profile.education_level.capitalize()} matches requirement")
        else:
            failed.append(
                f"Education level '{profile.education_level}' does not match allowed tiers: {', '.join(allowed_edu)}"
            )

    # 2. Income Limit Check
    income_limit = rules.get("income_limit") or rules.get("max_annual_income")
    if income_limit is not None:
        try:
            limit_val = float(income_limit)
            if profile.annual_income is None:
                unknown.append(f"Family income ceiling check requires income declaration (Limit: ₹{limit_val:,.0f})")
            elif profile.annual_income <= limit_val:
                passed.append(
                    f"Annual income ₹{profile.annual_income:,.0f} is within the ₹{limit_val:,.0f} cutoff limit"
                )
            else:
                failed.append(
                    f"Annual income ₹{profile.annual_income:,.0f} exceeds the ₹{limit_val:,.0f} maximum cutoff"
                )
        except (ValueError, TypeError):
            pass

    # 3. State / Regional Domicile Check
    allowed_regions = rules.get("allowed_regions") or rules.get("regions")
    required_state = rules.get("state")

    if required_state:
        if not profile.state:
            unknown.append(f"State residency required: {required_state}")
        elif profile.state.lower() == required_state.lower():
            passed.append(f"State domicile matches {required_state}")
        else:
            failed.append(f"Restricted to {required_state} residents (your state is {profile.state})")
    elif allowed_regions:
        if isinstance(allowed_regions, str):
            allowed_regions = [allowed_regions]
        allowed_regions_lower = [r.lower() for r in allowed_regions]

        if any(r in ["national", "global", "all", "india"] for r in allowed_regions_lower):
            passed.append(f"Available across all {opportunity.country or 'national'} institutions")
        else:
            if not profile.state:
                unknown.append("Regional state domicile required for verification")
            elif profile.state.lower() in allowed_regions_lower:
                passed.append(f"State domicile {profile.state} matches eligible regions")
            else:
                failed.append(f"Not eligible in {profile.state}. Restricted to: {', '.join(allowed_regions)}")

    # 4. Academic Year Check
    min_year = rules.get("min_academic_year")
    max_year = rules.get("max_academic_year")

    if min_year is not None:
        if profile.academic_year is None:
            unknown.append(f"Minimum Academic Year {min_year} check requires graduation year in profile")
        elif profile.academic_year >= int(min_year):
            passed.append(f"Academic Year {profile.academic_year} is >= Year {min_year}")
        else:
            failed.append(f"Requires Year {min_year} or above (you are in Year {profile.academic_year})")

    if max_year is not None:
        if profile.academic_year is None:
            unknown.append(f"Maximum Academic Year {max_year} check requires academic year in profile")
        elif profile.academic_year <= int(max_year):
            passed.append(f"Academic Year {profile.academic_year} meets Year {max_year} maximum limit")
        else:
            failed.append(f"Open only up to Year {max_year}")

    # 5. Course / Domain Specialization Check
    domains = rules.get("domains") or rules.get("allowed_domains") or rules.get("course_keywords")
    if domains:
        if isinstance(domains, str):
            domains = [domains]
        user_course = (profile.course_or_degree or "").lower()

        if not user_course:
            unknown.append(f"Degree check: requires specialization in {', '.join(domains)}")
        else:
            matched_domain = any(d.lower() in user_course for d in domains)
            if matched_domain:
                passed.append(f"Degree '{profile.course_or_degree}' matches required technical track")
            else:
                failed.append(f"Restricted to domains: {', '.join(domains)}")

    # 6. Student Status Prerequisite Check
    if rules.get("requires_student_email") or rules.get("requires_enrolled_status"):
        if profile.education_level in ["undergraduate", "postgraduate", "diploma", "school"]:
            passed.append("Enrolled student eligibility verified")
        else:
            unknown.append("Requires active university enrollment and official college verification")

    # Determine Match Status
    if failed:
        status = "NOT_ELIGIBLE"
        reasons.append(failed[0])
    elif unknown:
        if passed:
            status = "POTENTIALLY_ELIGIBLE"
            reasons.append(f"Partially qualified: {passed[0]}. Please verify: {unknown[0]}.")
        else:
            status = "UNKNOWN"
            reasons.append(f"Profile criteria incomplete. Missing: {unknown[0]}.")
    else:
        status = "MATCHED"
        if passed:
            reasons.append(f"100% criteria match: {passed[0]}.")
        else:
            reasons.append("All program requirements satisfied.")

    # Calculate Fit Score using Section 10.4 Formula:
    # OpportunityScore = 0.30E + 0.25B + 0.20R + 0.15U + 0.10C
    # E: Eligibility Confidence
    e_weights = {
        "MATCHED": 1.0,
        "POTENTIALLY_ELIGIBLE": 0.65,
        "UNKNOWN": 0.35,
        "NOT_ELIGIBLE": 0.05,
    }
    E = e_weights.get(status, 0.3)

    # B: Benefit Value
    if opportunity.benefit_amount:
        # Scale: ₹2,00,000 or above = 1.0
        B = min(1.0, max(0.2, math.log10(max(100.0, opportunity.benefit_amount)) / 5.3))
    elif opportunity.benefit_type in ["credit", "internship", "certification"]:
        B = 0.8
    else:
        B = 0.5

    # R: Relevance to profile skills
    user_skills = [s.lower() for s in (profile.skills or [])]
    desc_corpus = f"{opportunity.title} {opportunity.description}".lower()
    skill_hits = sum(1 for s in user_skills if s in desc_corpus)
    R = min(1.0, max(0.4, 0.4 + (skill_hits * 0.2)))

    # U: Urgency (Time remaining to deadline)
    now = datetime.now(timezone.utc)
    if opportunity.application_deadline:
        deadline = opportunity.application_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        days_left = (deadline - now).total_seconds() / 86400.0
        if days_left <= 0:
            U = 0.0  # Expired
        elif days_left <= 7:
            U = 1.0
        elif days_left <= 30:
            U = 0.8
        elif days_left <= 60:
            U = 0.5
        else:
            U = 0.3
    else:
        U = 0.4  # Ongoing

    # C: Source Trust / Verification Status
    c_weights = {
        "officially_verified": 1.0,
        "partially_verified": 0.75,
        "unverified": 0.4,
        "expired": 0.0,
    }
    C = c_weights.get(opportunity.verification_status, 0.7)

    # Composite Score
    fit_score = (0.30 * E) + (0.25 * B) + (0.20 * R) + (0.15 * U) + (0.10 * C)
    fit_score = round(min(1.0, max(0.0, fit_score)), 2)

    return MatchEvaluationResult(
        match_status=status,
        fit_score=fit_score,
        passed_criteria=passed,
        failed_criteria=failed,
        unknown_criteria=unknown,
        reasons=reasons,
    )
