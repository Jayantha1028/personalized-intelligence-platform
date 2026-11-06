from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import User, UserProfile

router = APIRouter(prefix="/profile")


class UserProfileUpdate(BaseModel):
    country: Optional[str] = "India"
    state: Optional[str] = "Karnataka"
    education_level: Optional[str] = "undergraduate"
    course_or_degree: Optional[str] = "B.Tech Computer Science"
    academic_year: Optional[int] = 3
    annual_income: Optional[float] = 400000.0
    age: Optional[int] = 21
    skills: Optional[List[str]] = ["Python", "FastAPI", "React", "Cloud"]
    preferences: Optional[Dict[str, Any]] = {"notifications": True, "digest_frequency": "daily"}


class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    country: str
    state: Optional[str]
    education_level: Optional[str]
    course_or_degree: Optional[str]
    academic_year: Optional[int]
    annual_income: Optional[float]
    age: Optional[int]
    skills: List[str]
    preferences: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=UserProfileResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    """Retrieve the primary user profile (default/demo user for single-tenant mode)."""
    # Fetch first profile or create default profile
    stmt = select(UserProfile)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    if not profile:
        # Create default user + profile if none exists
        user = User(
            email="user@intelligence.local",
            hashed_password="mock_hashed_password",
            full_name="Alex Sharma",
            is_active=True,
        )
        db.add(user)
        await db.flush()

        profile = UserProfile(
            user_id=user.id,
            country="India",
            state="Karnataka",
            education_level="undergraduate",
            course_or_degree="B.Tech Computer Science",
            academic_year=3,
            annual_income=400000.0,
            age=21,
            skills=["Python", "Cloud Computing", "AI/ML", "React"],
            preferences={"notifications": True, "daily_digest": True},
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return profile


@router.put("", response_model=UserProfileResponse)
async def update_profile(data: UserProfileUpdate, db: AsyncSession = Depends(get_db)):
    """Update profile attributes used by the deterministic eligibility engine."""
    stmt = select(UserProfile)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile
