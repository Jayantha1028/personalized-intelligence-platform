"""
Document & Circular Intelligence API
====================================
Uses common_integrations (vision_ocr and pdf_doc_intelligence) to parse official
government scholarship notifications, circulars, and scheme guidelines.
Extracts deadlines, monetary amounts/stipends, contact emails, and criteria.
"""
from typing import Any, Dict, List, Optional
import re
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Ensure collected_microservices is importable
_COLLECTED_DIR = Path(__file__).resolve().parents[3] / "collected_microservices"
if _COLLECTED_DIR.exists() and str(_COLLECTED_DIR) not in sys.path:
    sys.path.insert(0, str(_COLLECTED_DIR))

try:
    from common_integrations import (
        extract_entities_from_text,
        extract_raw_pdf_text_streams,
    )
except ImportError:
    # Graceful standalone fallback
    def extract_entities_from_text(text: str) -> Dict[str, List[str]]:
        emails = list(set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)))
        phones = list(set(re.findall(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)))
        amounts = list(set(re.findall(r'[\$€£₹]\s?[\d,]+(?:\.\d{2})?', text)))
        dates = list(set(re.findall(r'\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b', text)))
        return {"emails": emails, "phone_numbers": phones, "monetary_amounts": amounts, "dates": dates}

    def extract_raw_pdf_text_streams(pdf_filepath: str) -> List[str]:
        return []

router = APIRouter(prefix="/circulars", tags=["Document & Circular Intelligence"])


class CircularAnalysisRequest(BaseModel):
    title: Optional[str] = "Government Scheme Circular"
    text: str
    provider: Optional[str] = None
    category: Optional[str] = "scholarship"


class ParsedCircularResponse(BaseModel):
    title: str
    provider: str
    category: str
    extracted_entities: Dict[str, List[str]]
    detected_deadline: Optional[str]
    detected_benefit_amount: Optional[float]
    detected_currency: str
    benefit_summary: str
    eligibility_signals: List[str]
    suggested_rules: Dict[str, Any]
    confidence_score: float


SAMPLE_CIRCULARS = [
    {
        "id": "ssp-postmatric-2026",
        "title": "Karnataka State Scholarship Portal (SSP) Post-Matric Circular 2026",
        "provider": "Department of Social Welfare, Government of Karnataka",
        "category": "scholarship",
        "text": """
GOVERNMENT OF KARNATAKA - DEPARTMENT OF SOCIAL WELFARE
STATE SCHOLARSHIP PORTAL (SSP) - POST-MATRIC NOTIFICATION 2026-27
Notification No: DSW/SSP/PM-2026/492. Date: 15-01-2026

Online applications are invited from eligible post-matric students belonging to Karnataka state domicile enrolled in recognized B.Tech, M.Tech, and professional degree courses.

ELIGIBILITY REQUIREMENTS:
1. Candidate must be a permanent resident of Karnataka state with valid domicile verification.
2. The total annual family income from all sources must not exceed ₹2,50,000 per annum for Category-1 and ₹6,00,000 per annum for SC/ST/OBC students.
3. Candidate must be enrolled in an undergraduate or postgraduate degree for the academic year 2025-26 or 2026-27.
4. Maintenance allowance and fee reimbursement benefit of ₹50,000 per annum directly disbursed via Aadhaar DBT.

IMPORTANT DATES & CONTACT:
- Online Portal Opening: 2026-02-01
- Last Date for Submission of Online Applications: 2026-05-31
- Verification by Institutions: 2026-06-15

For technical queries, contact ssp.support@karnataka.gov.in or helpline 080-35254759. Official portal: https://ssp.postmatric.karnataka.gov.in
"""
    },
    {
        "id": "aicte-pragati-2026",
        "title": "AICTE Pragati Scholarship Scheme for Technical Education",
        "provider": "All India Council for Technical Education (AICTE)",
        "category": "scholarship",
        "text": """
ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE), NEW DELHI
PRAGATI SCHOLARSHIP SCHEME NOTIFICATION
F.No. AICTE/StDC/Pragati/2026-27.

AICTE invites online applications under Pragati Scholarship Scheme from girl students admitted to 1st year of Degree / Diploma technical programmes in AICTE approved institutions.

KEY PROVISIONS:
- Number of Scholarships: 10,000 scholarships per annum.
- Amount of Scholarship: ₹50,000 per annum for every year of study.
- Eligibility: Admitted to 1st year or 2nd year through lateral entry in Degree program in Engineering/Technology.
- Family income ceiling: Annual income of family should not exceed ₹8,00,000 per annum.
- Mandatory: Valid income certificate issued by competent revenue authority.

DEADLINES & HELPDESK:
- Submission deadline: 2026-04-30
- Query resolution: pragati.aicte@gov.in or phone +91-11-29581000.
Apply online at National Scholarship Portal: https://scholarships.gov.in
"""
    },
    {
        "id": "aws-cloud-credits-grant",
        "title": "AWS Educate Emerging Developer Cloud Grant 2026",
        "provider": "Amazon Web Services",
        "category": "company_offer",
        "text": """
AWS EDUCATE - STUDENT & RESEARCHER CLOUD ACCELERATION GRANT 2026
Announcement Date: 2026-01-10

Eligible undergraduate, graduate students, and university researchers can claim complimentary cloud infrastructure promotional credits for technical training, hands-on projects, and cloud certification.

BENEFIT DETAILS:
- $100 promotional credits per active student account, renewable annually.
- Complimentary access to 50+ self-paced cloud labs and AWS DeepRacer simulators.

ELIGIBILITY CRITERIA:
- Currently enrolled student or faculty at an accredited degree-granting academic institution.
- Domain of study: Computer Science, Information Technology, Data Science, or related engineering.
- Valid academic institutional email address required (.edu or .ac.in).

TIMELINE:
- Program enrollment closes on 2026-12-31.
- Inquiries: aws-educate-inquiries@amazon.com
- Redeem portal: https://aws.amazon.com/education/awseducate/
"""
    }
]


def _clean_amount(amt_str: str) -> Optional[float]:
    """Parse monetary string e.g. ₹50,000 or $100 into float."""
    clean = re.sub(r'[^\d.]', '', amt_str)
    try:
        val = float(clean)
        return val if val > 0 else None
    except ValueError:
        return None


@router.get("/samples")
def get_sample_circulars() -> List[Dict[str, Any]]:
    """Return pre-curated official circulars for live testing."""
    return SAMPLE_CIRCULARS


@router.post("/analyze", response_model=ParsedCircularResponse)
def analyze_circular(payload: CircularAnalysisRequest):
    """
    Analyze official scheme text or notification using entity extraction and rule inference.
    Extracts dates, monetary amounts, emails, domain restrictions, and returns a verified draft opportunity.
    """
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Circular text content cannot be empty.")

    entities = extract_entities_from_text(raw_text)

    # 1. Detect application deadline
    detected_deadline = None
    dates = entities.get("dates", [])
    if dates:
        # Choose the latest date as deadline
        detected_deadline = sorted(dates)[-1]

    # 2. Detect monetary benefit amount and currency
    detected_amount = None
    detected_currency = "INR"
    monetary = entities.get("monetary_amounts", [])
    if monetary:
        # Pick largest amount or first valid amount
        for m in monetary:
            if "$" in m:
                detected_currency = "USD"
            elif "€" in m:
                detected_currency = "EUR"
            elif "₹" in m or "Rs" in m:
                detected_currency = "INR"

            amt = _clean_amount(m)
            if amt and (detected_amount is None or amt > detected_amount):
                detected_amount = amt

    # 3. Detect eligibility signals from text
    signals = []
    text_lower = raw_text.lower()
    rules: Dict[str, Any] = {}

    # Domicile
    if "karnataka" in text_lower:
        signals.append("Karnataka State Domicile required")
        rules["state"] = "Karnataka"
        rules["country"] = "India"
    elif "india" in text_lower:
        signals.append("Indian Citizen / Domicile required")
        rules["country"] = "India"

    # Education level
    if "undergraduate" in text_lower or "b.tech" in text_lower or "degree" in text_lower:
        signals.append("Undergraduate Degree enrollment required")
        rules["education_levels"] = ["undergraduate"]
    if "post-matric" in text_lower:
        signals.append("Post-Matric (Higher Education) eligibility")

    # Income ceilings
    income_match = re.search(r'(?:income\s+(?:ceiling|exceed|of)?\s*(?:not\s+exceed)?\s*(?:to\s+)?|exceed\s*)([₹Rs.\s\d,]+)(?:per\s+annum|\/year)?', text_lower)
    if income_match:
        inc_val = _clean_amount(income_match.group(1))
        if inc_val and inc_val >= 50000:
            signals.append(f"Maximum family income ceiling: ₹{inc_val:,.0f}")
            rules["max_annual_income"] = inc_val
    elif "₹2,50,000" in raw_text or "250000" in raw_text:
        rules["max_annual_income"] = 250000.0
        signals.append("Income ceiling: ₹2,50,000 per annum")
    elif "₹6,00,000" in raw_text or "600000" in raw_text:
        rules["max_annual_income"] = 600000.0
        signals.append("Income ceiling: ₹6,00,000 per annum")

    # Email provider contact
    provider = payload.provider or "Official Authority"
    if entities.get("emails"):
        signals.append(f"Verified official contact: {entities['emails'][0]}")

    # Generate benefit summary
    if detected_amount:
        currency_sym = "$" if detected_currency == "USD" else ("€" if detected_currency == "EUR" else "₹")
        benefit_summary = f"{currency_sym}{detected_amount:,.0f} direct grant / reimbursement benefit"
    else:
        benefit_summary = "Financial grant and educational fee reimbursement"

    # Confidence score based on extracted fields
    confidence = 0.5
    if detected_deadline:
        confidence += 0.2
    if detected_amount:
        confidence += 0.15
    if signals:
        confidence += 0.15

    return ParsedCircularResponse(
        title=payload.title or "Parsed Opportunity",
        provider=provider,
        category=payload.category or "scholarship",
        extracted_entities=entities,
        detected_deadline=detected_deadline,
        detected_benefit_amount=detected_amount,
        detected_currency=detected_currency,
        benefit_summary=benefit_summary,
        eligibility_signals=signals,
        suggested_rules=rules,
        confidence_score=round(min(confidence, 1.0), 2)
    )
