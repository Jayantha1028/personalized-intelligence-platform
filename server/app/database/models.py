from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    interests: Mapped[List["UserInterest"]] = relationship("UserInterest", back_populates="user", cascade="all, delete-orphan")
    opportunity_matches: Mapped[List["OpportunityMatch"]] = relationship("OpportunityMatch", back_populates="user", cascade="all, delete-orphan")
    saved_items: Mapped[List["SavedItem"]] = relationship("SavedItem", back_populates="user", cascade="all, delete-orphan")
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="India")
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g., Karnataka, Delhi
    education_level: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # undergraduate, graduate, etc.
    course_or_degree: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # B.Tech Computer Science
    academic_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1, 2, 3, 4
    annual_income: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # For need-based scholarships
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    skills: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    preferences: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="profile")


class UserInterest(Base):
    __tablename__ = "user_interests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # AI, Cloud, Cybersecurity, Science, Startups
    weight: Mapped[float] = mapped_column(Float, default=1.0)  # User interest weighting (0.0 to 1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="interests")


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # news, scholarship, government_scheme, company_offer, career
    source_type: Mapped[str] = mapped_column(String(50), default="rss")  # rss, api, html
    base_url: Mapped[str] = mapped_column(String(500), nullable=False)
    feed_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India")
    region: Mapped[str] = mapped_column(String(100), default="National")
    trust_level: Mapped[str] = mapped_column(String(50), default="official")  # official, verified_publisher, aggregator
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    fetch_interval_minutes: Mapped[int] = mapped_column(Integer, default=60)
    last_fetched_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_status: Mapped[str] = mapped_column(String(50), default="never_run")  # success, failure, never_run
    failure_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    articles: Mapped[List["Article"]] = relationship("Article", back_populates="source")
    opportunities: Mapped[List["Opportunity"]] = relationship("Opportunity", back_populates="source")
    runs: Mapped[List["SourceRun"]] = relationship("SourceRun", back_populates="source", cascade="all, delete-orphan")


class SourceRun(Base):
    __tablename__ = "source_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)  # running, success, error
    items_found: Mapped[int] = mapped_column(Integer, default=0)
    items_created: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    source: Mapped["Source"] = relationship("Source", back_populates="runs")


class ArticleCluster(Base):
    __tablename__ = "article_clusters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    primary_topic: Mapped[str] = mapped_column(String(100), index=True)
    article_count: Mapped[int] = mapped_column(Integer, default=1)
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    articles: Mapped[List["Article"]] = relationship("Article", back_populates="cluster")


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    cluster_id: Mapped[Optional[int]] = mapped_column(ForeignKey("article_clusters.id", ondelete="SET NULL"), nullable=True)
    
    title: Mapped[str] = mapped_column(String(500), index=True, nullable=False)
    canonical_url: Mapped[str] = mapped_column(String(1000), unique=True, index=True, nullable=False)
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    raw_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    clean_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 3 factual bullet points
    summary_bullets: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    personal_impact: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    practical_actions: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    
    topic: Mapped[str] = mapped_column(String(100), default="Technology", index=True)
    quality_score: Mapped[float] = mapped_column(Float, default=0.8)
    relevance_score: Mapped[float] = mapped_column(Float, default=0.7)
    
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    source: Mapped["Source"] = relationship("Source", back_populates="articles")
    cluster: Mapped[Optional["ArticleCluster"]] = relationship("ArticleCluster", back_populates="articles")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source_id: Mapped[Optional[int]] = mapped_column(ForeignKey("sources.id", ondelete="SET NULL"), nullable=True)
    
    title: Mapped[str] = mapped_column(String(500), index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # scholarship, government_scheme, company_offer, career, student_program
    provider: Mapped[str] = mapped_column(String(255), index=True, nullable=False)  # e.g., National Scholarship Portal, Google, Microsoft, AICTE
    
    country: Mapped[str] = mapped_column(String(100), default="India")
    region: Mapped[str] = mapped_column(String(100), default="National")
    
    description: Mapped[str] = mapped_column(Text, nullable=False)
    benefit_type: Mapped[str] = mapped_column(String(100), default="financial")  # financial, discount, credit, internship, certification
    benefit_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(String(10), default="INR")
    benefit_summary: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # e.g., "₹50,000 / year + Tuition waiver"
    
    # Structured deterministic eligibility rules
    eligibility_rules: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    application_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    official_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    supporting_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    
    # Trust & Verification
    verification_status: Mapped[str] = mapped_column(String(50), default="partially_verified")  # officially_verified, partially_verified, unverified, expired
    status: Mapped[str] = mapped_column(String(50), default="open")  # open, upcoming, closed, expired
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=utc_now)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    source: Mapped[Optional["Source"]] = relationship("Source", back_populates="opportunities")
    matches: Mapped[List["OpportunityMatch"]] = relationship("OpportunityMatch", back_populates="opportunity", cascade="all, delete-orphan")
    verification_records: Mapped[List["VerificationRecord"]] = relationship("VerificationRecord", back_populates="opportunity", cascade="all, delete-orphan")


class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    opportunity_id: Mapped[int] = mapped_column(ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    verified_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    evidence_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verifier: Mapped[str] = mapped_column(String(100), default="automated_official_check")
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    opportunity: Mapped["Opportunity"] = relationship("Opportunity", back_populates="verification_records")


class OpportunityMatch(Base):
    __tablename__ = "opportunity_matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id: Mapped[int] = mapped_column(ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    
    # MATCHED, POTENTIALLY_ELIGIBLE, NOT_ELIGIBLE, UNKNOWN
    match_status: Mapped[str] = mapped_column(String(50), index=True, default="UNKNOWN")
    fit_score: Mapped[float] = mapped_column(Float, default=0.5)
    
    passed_criteria: Mapped[List[str]] = mapped_column(JSON, default=list)
    failed_criteria: Mapped[List[str]] = mapped_column(JSON, default=list)
    unknown_criteria: Mapped[List[str]] = mapped_column(JSON, default=list)
    reasons: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="opportunity_matches")
    opportunity: Mapped["Opportunity"] = relationship("Opportunity", back_populates="matches")


class SavedItem(Base):
    __tablename__ = "saved_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    item_type: Mapped[str] = mapped_column(String(50), nullable=False)  # article, opportunity
    item_id: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="saved_items")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id: Mapped[int] = mapped_column(ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="interested")  # interested, in_progress, applied, awarded, rejected
    applied_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="applications")
    opportunity: Mapped["Opportunity"] = relationship("Opportunity")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(50), index=True)  # deadline_approaching, match_found, digest, breaking_news
    reference_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # opportunity, article, system
    reference_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    channel: Mapped[str] = mapped_column(String(50), default="in_app")  # in_app, telegram, email
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="notifications")
