"""Authentication API Endpoints.
Provides user registration, scrypt login, JWT Bearer token issuance,
instant 1-click demo access, and authenticated session introspection.
"""
from __future__ import annotations

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import User, UserProfile
from app.auth.security import (
    hash_password,
    check_password,
    issue_token,
    user_public,
    get_current_user,
    DUMMY_PASSWORD_HASH,
    now,
)
from app.opportunity_engine.recalculator import recalculate_user_matches

router = APIRouter(prefix="/auth")


# Schemas
class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Optional[str] = "STUDENT"
    state: Optional[str] = "Karnataka"
    course_or_degree: Optional[str] = "B.Tech Computer Science"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class DemoLoginRequest(BaseModel):
    account_type: str = Field(default="student")  # "student", "fellow", "admin"


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    message: str
    token: str
    tokenType: str = "Bearer"
    user: Dict[str, Any]
    profile: Optional[Dict[str, Any]] = None


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account with scrypt password hashing and issue JWT token."""
    normalized_email = str(data.email).lower().strip()

    stmt = select(User).where(User.email == normalized_email)
    res = await db.execute(stmt)
    existing = res.scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    user = User(
        email=normalized_email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name.strip(),
        role=(data.role or "STUDENT").upper(),
        is_active=True,
        is_admin=bool((data.role or "").upper() == "ADMIN"),
    )
    db.add(user)
    await db.flush()

    profile = UserProfile(
        user_id=user.id,
        country="India",
        state=data.state or "Karnataka",
        education_level="undergraduate" if user.role == "STUDENT" else "graduate",
        course_or_degree=data.course_or_degree or "B.Tech Computer Science",
        academic_year=3,
        annual_income=400000.0,
        age=21,
        phone="",
        headline=f"{user.role.title()} in Karnataka Tech Ecosystem",
        skills=["Python", "Cloud Computing", "AI/ML"],
        preferences={"notifications": True, "digest_frequency": "daily"},
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)

    token = issue_token(user)

    # Recalculate opportunities for the new user
    try:
        await recalculate_user_matches(db, user.id)
    except Exception:
        pass

    return {
        "message": "Account created successfully.",
        "token": token,
        "tokenType": "Bearer",
        "user": user_public(user),
        "profile": {
            "id": profile.id,
            "state": profile.state,
            "course_or_degree": profile.course_or_degree,
            "academic_year": profile.academic_year,
            "skills": profile.skills,
        },
    }


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user credentials using scrypt and issue a 256-bit JWT Bearer token."""
    normalized_email = str(data.email).lower().strip()

    stmt = select(User).where(User.email == normalized_email)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if user:
        password_ok = check_password(data.password, user.hashed_password)
    else:
        check_password(data.password, DUMMY_PASSWORD_HASH)
        password_ok = False

    if not user or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently suspended.",
        )

    token = issue_token(user)

    # Fetch profile
    prof_stmt = select(UserProfile).where(UserProfile.user_id == user.id)
    prof_res = await db.execute(prof_stmt)
    profile = prof_res.scalars().first()

    profile_dict = None
    if profile:
        profile_dict = {
            "id": profile.id,
            "state": profile.state,
            "course_or_degree": profile.course_or_degree,
            "academic_year": profile.academic_year,
            "phone": profile.phone or "",
            "headline": profile.headline or "",
            "skills": profile.skills or [],
        }

    return {
        "message": "Login successful.",
        "token": token,
        "tokenType": "Bearer",
        "user": user_public(user),
        "profile": profile_dict,
    }


@router.post("/demo-login", response_model=AuthResponse)
async def demo_login(data: DemoLoginRequest, db: AsyncSession = Depends(get_db)):
    """Instant 1-Click login for developer preview and testing.
    Mirrors the reference microservices portal demo switcher.
    """
    account_type = (data.account_type or "student").lower()

    if account_type == "fellow":
        email = "ananya.rao@karnataka.gov.in"
        full_name = "Ananya Rao"
        role = "RESEARCHER"
        degree = "M.Tech AI & Data Engineering"
        headline = "KDEM Elevate Fellow & IISc AI Researcher"
        skills = ["Python", "PyTorch", "Distributed Systems", "RAG", "LLMs"]
    elif account_type == "admin":
        email = "admin@intelligence.local"
        full_name = "Platform Administrator"
        role = "ADMIN"
        degree = "Principal Infrastructure Architect"
        headline = "Antigravity Intelligence Ops Lead"
        skills = ["DevSecOps", "FastAPI", "Kubernetes", "Next.js", "PostgreSQL"]
    else:  # default student
        email = "alex.sharma@example.in"
        full_name = "Alex Sharma"
        role = "STUDENT"
        degree = "B.Tech Computer Science"
        headline = "3rd Year Computer Science Undergrad @ VTU Bengaluru"
        skills = ["Python", "FastAPI", "Next.js", "Cloud", "AI/ML"]

    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user:
        user = User(
            email=email,
            hashed_password=hash_password(f"{role.title()}Pass123!"),
            full_name=full_name,
            role=role,
            is_active=True,
            is_admin=bool(role == "ADMIN"),
        )
        db.add(user)
        await db.flush()

        profile = UserProfile(
            user_id=user.id,
            country="India",
            state="Karnataka",
            education_level="graduate" if role == "RESEARCHER" else "undergraduate",
            course_or_degree=degree,
            academic_year=2 if role == "RESEARCHER" else 3,
            annual_income=300000.0 if role == "RESEARCHER" else 400000.0,
            age=24 if role == "RESEARCHER" else 21,
            phone="+91 98860 12345",
            headline=headline,
            skills=skills,
            preferences={"notifications": True, "digest_frequency": "daily"},
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)
    else:
        # Ensure role is set
        user.role = role
        user.full_name = full_name
        await db.commit()

    token = issue_token(user)

    prof_stmt = select(UserProfile).where(UserProfile.user_id == user.id)
    prof_res = await db.execute(prof_stmt)
    profile = prof_res.scalars().first()

    profile_dict = None
    if profile:
        profile_dict = {
            "id": profile.id,
            "state": profile.state,
            "course_or_degree": profile.course_or_degree,
            "academic_year": profile.academic_year,
            "phone": profile.phone or "",
            "headline": profile.headline or "",
            "skills": profile.skills or [],
        }

    return {
        "message": f"Switched to {full_name} ({role})",
        "token": token,
        "tokenType": "Bearer",
        "user": user_public(user),
        "profile": profile_dict,
    }


@router.get("/me")
async def get_my_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve active authenticated user details and security session properties."""
    prof_stmt = select(UserProfile).where(UserProfile.user_id == current_user.id)
    prof_res = await db.execute(prof_stmt)
    profile = prof_res.scalars().first()

    return {
        "status": "authenticated",
        "user": user_public(current_user),
        "session": {
            "tokenType": "Bearer",
            "algorithm": "HS256",
            "security": "256-Bit Cryptographic Session Token",
            "role": getattr(current_user, "role", "STUDENT"),
        },
        "profile": {
            "id": profile.id if profile else None,
            "country": profile.country if profile else "India",
            "state": profile.state if profile else "Karnataka",
            "course_or_degree": profile.course_or_degree if profile else "B.Tech Computer Science",
            "academic_year": profile.academic_year if profile else 3,
            "phone": profile.phone if profile else "",
            "headline": profile.headline if profile else "",
            "skills": profile.skills if profile else [],
            "preferences": profile.preferences if profile else {},
        } if profile else None,
    }


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update password with verification of existing scrypt credentials."""
    if not check_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match.",
        )

    current_user.hashed_password = hash_password(data.new_password)
    await db.commit()

    return {"message": "Password changed successfully."}
