from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import User, UserProfile
from app.auth.security import get_current_user
from app.opportunity_engine.recalculator import recalculate_user_matches

router = APIRouter(prefix="/profile")


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    country: Optional[str] = "India"
    state: Optional[str] = "Karnataka"
    education_level: Optional[str] = "undergraduate"
    course_or_degree: Optional[str] = "B.Tech Computer Science"
    academic_year: Optional[int] = 3
    annual_income: Optional[float] = 400000.0
    age: Optional[int] = 21
    phone: Optional[str] = None
    headline: Optional[str] = None
    skills: Optional[List[str]] = ["Python", "FastAPI", "React", "Cloud"]
    preferences: Optional[Dict[str, Any]] = {"notifications": True, "digest_frequency": "daily"}


class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = "STUDENT"
    country: str
    state: Optional[str]
    education_level: Optional[str]
    course_or_degree: Optional[str]
    academic_year: Optional[int]
    annual_income: Optional[float]
    age: Optional[int]
    phone: Optional[str] = None
    headline: Optional[str] = None
    skills: List[str]
    preferences: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=UserProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the active authenticated user's profile."""
    stmt = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            country="India",
            state="Karnataka",
            education_level="undergraduate",
            course_or_degree="B.Tech Computer Science",
            academic_year=3,
            annual_income=400000.0,
            age=21,
            phone="+91 98860 12345",
            headline="3rd Year Computer Science Undergrad @ VTU Bengaluru",
            skills=["Python", "Cloud Computing", "AI/ML", "React"],
            preferences={"notifications": True, "daily_digest": True},
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    res_dict = {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": getattr(current_user, "role", "STUDENT") or "STUDENT",
        "country": profile.country,
        "state": profile.state,
        "education_level": profile.education_level,
        "course_or_degree": profile.course_or_degree,
        "academic_year": profile.academic_year,
        "annual_income": profile.annual_income,
        "age": profile.age,
        "phone": profile.phone or "",
        "headline": profile.headline or "",
        "skills": profile.skills or [],
        "preferences": profile.preferences or {},
    }
    return res_dict


@router.put("", response_model=UserProfileResponse)
async def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profile attributes used by the deterministic eligibility engine."""
    stmt = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_dict = data.model_dump(exclude_unset=True)

    if "full_name" in update_dict and update_dict["full_name"]:
        current_user.full_name = update_dict.pop("full_name").strip()

    for field, value in update_dict.items():
        if hasattr(profile, field):
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    await db.refresh(current_user)

    # Automatically re-evaluate all deterministic opportunity matches for the user
    try:
        await recalculate_user_matches(db, profile.user_id)
    except Exception:
        pass

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": getattr(current_user, "role", "STUDENT") or "STUDENT",
        "country": profile.country,
        "state": profile.state,
        "education_level": profile.education_level,
        "course_or_degree": profile.course_or_degree,
        "academic_year": profile.academic_year,
        "annual_income": profile.annual_income,
        "age": profile.age,
        "phone": profile.phone or "",
        "headline": profile.headline or "",
        "skills": profile.skills or [],
        "preferences": profile.preferences or {},
    }
