"""
Academic Records Simulator API
==============================
Integrates with academic-records-service data to simulate student academic verification,
allowing users to link verified CGPA, department/specialization, and attendance records
to their platform profile and deterministically re-score scholarships and schemes.
"""
from typing import Any, Dict, List, Optional
import re
import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import pandas as pd

from app.database.session import get_db
from app.database.models import UserProfile
from app.opportunity_engine.recalculator import recalculate_user_matches

# Ensure collected_microservices is importable
_COLLECTED_DIR = Path(__file__).resolve().parents[3] / "collected_microservices"
if _COLLECTED_DIR.exists() and str(_COLLECTED_DIR) not in sys.path:
    sys.path.insert(0, str(_COLLECTED_DIR))

router = APIRouter(prefix="/academic", tags=["Academic Records Simulator"])

STUDENT_DATA_PATH = _COLLECTED_DIR / "academic-records-service" / "data" / "student_data.csv"


def _load_students_df() -> pd.DataFrame:
    """Load academic records dataset."""
    if STUDENT_DATA_PATH.exists():
        try:
            return pd.read_csv(STUDENT_DATA_PATH)
        except Exception:
            pass
    # Baseline fallback records
    return pd.DataFrame([
        {"id": 101, "name": "Aditi Rao", "class": "B.Tech 3rd Year", "specialization": "Computer Science", "mentor": "Dr. Ramesh Kumar", "attendance": 94.5, "cgpa": 8.92},
        {"id": 102, "name": "Rohan Deshmukh", "class": "B.Tech 4th Year", "specialization": "Information Science", "mentor": "Dr. Priya Nair", "attendance": 88.0, "cgpa": 7.85},
        {"id": 103, "name": "Kavya Murthy", "class": "B.Tech 2nd Year", "specialization": "AI & Data Science", "mentor": "Prof. S. Rao", "attendance": 98.2, "cgpa": 9.40},
        {"id": 104, "name": "Siddharth Hegde", "class": "B.Tech 3rd Year", "specialization": "Mechanical", "mentor": "Dr. V. Prasad", "attendance": 76.4, "cgpa": 6.80},
    ])


@router.get("/records")
def get_academic_records(
    specialization: Optional[str] = Query(None, description="Filter by specialization (e.g. Computer Science, Civil, Mechanical)"),
    min_cgpa: Optional[float] = Query(None, ge=0.0, le=10.0),
    limit: int = Query(50, ge=1, le=200)
) -> Dict[str, Any]:
    """Retrieve simulated university student registry for verification."""
    df = _load_students_df()
    if df.empty:
        return {"total": 0, "students": []}

    if specialization:
        df = df[df["specialization"].astype(str).str.lower().str.contains(specialization.lower().strip())]
    if min_cgpa is not None:
        df = df[df["cgpa"] >= min_cgpa]

    total = len(df)
    records = df.head(limit).to_dict(orient="records")
    return {
        "total_matched": total,
        "students": records
    }


@router.get("/records/{student_id}")
def get_single_student_record(student_id: int) -> Dict[str, Any]:
    """Fetch single student verification record."""
    df = _load_students_df()
    match = df[df["id"] == student_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Student ID {student_id} not found in academic registry.")
    return match.iloc[0].to_dict()


@router.get("/stats")
def get_academic_stats() -> Dict[str, Any]:
    """Aggregate statistics across institutional student records."""
    df = _load_students_df()
    if df.empty:
        return {}

    spec_metrics = df.groupby("specialization").agg(
        student_count=("id", "count"),
        avg_cgpa=("cgpa", "mean"),
        avg_attendance=("attendance", "mean")
    ).reset_index()

    return {
        "total_enrolled": len(df),
        "overall_average_cgpa": round(float(df["cgpa"].mean()), 2),
        "overall_average_attendance": round(float(df["attendance"].mean()), 2),
        "specializations": spec_metrics.to_dict(orient="records")
    }


@router.post("/sync-profile/{student_id}")
async def sync_student_to_user_profile(
    student_id: int,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Sync verified student record into active UserProfile and re-evaluate opportunity matches.
    Updates course_or_degree, academic_year, CGPA, and attendance in profile preferences.
    """
    df = _load_students_df()
    match = df[df["id"] == student_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Student ID {student_id} not found in academic registry.")

    student = match.iloc[0].to_dict()

    # Fetch user profile
    stmt = select(UserProfile)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found. Initialize profile first.")

    # Parse academic year from class string (e.g. "B.Tech 3rd Year" -> 3)
    class_str = str(student.get("class", ""))
    year_match = re.search(r'(\d+)', class_str)
    academic_year = int(year_match.group(1)) if year_match else profile.academic_year

    # Update profile fields
    spec = str(student.get("specialization", "Engineering"))
    profile.education_level = "undergraduate"
    profile.course_or_degree = f"B.Tech {spec}"
    profile.academic_year = academic_year

    # Store verified academic metadata in preferences
    prefs = dict(profile.preferences or {})
    prefs["verified_student_id"] = student["id"]
    prefs["verified_student_name"] = student["name"]
    prefs["cgpa"] = float(student["cgpa"])
    prefs["attendance"] = float(student["attendance"])
    prefs["mentor"] = str(student.get("mentor", ""))
    prefs["academic_verification_status"] = "INSTITUTIONALLY_VERIFIED"
    profile.preferences = prefs

    await db.commit()
    await db.refresh(profile)

    # Recalculate deterministic eligibility matches
    recalc_result = await recalculate_user_matches(db, profile.user_id)

    return {
        "status": "success",
        "message": f"Successfully linked student record #{student['id']} ({student['name']}) to profile.",
        "student_record": student,
        "updated_profile": {
            "course_or_degree": profile.course_or_degree,
            "academic_year": profile.academic_year,
            "cgpa": prefs["cgpa"],
            "attendance": prefs["attendance"],
            "verification_status": prefs["academic_verification_status"]
        },
        "eligibility_recalculation": recalc_result
    }
