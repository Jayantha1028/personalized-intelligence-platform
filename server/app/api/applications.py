from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import Application, User, Opportunity

router = APIRouter(prefix="/applications")


class CreateApplicationRequest(BaseModel):
    opportunity_id: int
    status: str = "interested"  # interested, in_progress, applied, awarded, rejected
    notes: Optional[str] = None
    applied_date: Optional[datetime] = None


class UpdateApplicationRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_date: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    id: int
    opportunity_id: int
    opportunity_title: str
    provider: str
    category: str
    benefit_summary: Optional[str] = None
    official_url: str
    status: str
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(db: AsyncSession = Depends(get_db)):
    """List tracked opportunity applications and claim progress."""
    stmt = (
        select(Application, Opportunity)
        .join(Opportunity, Application.opportunity_id == Opportunity.id)
        .order_by(desc(Application.updated_at))
    )
    rows = (await db.execute(stmt)).all()

    items = []
    for app_row, opp in rows:
        items.append(
            ApplicationResponse(
                id=app_row.id,
                opportunity_id=opp.id,
                opportunity_title=opp.title,
                provider=opp.provider,
                category=opp.category,
                benefit_summary=opp.benefit_summary,
                official_url=opp.official_url,
                status=app_row.status,
                applied_date=app_row.applied_date,
                notes=app_row.notes,
                created_at=app_row.created_at,
                updated_at=app_row.updated_at,
            )
        )
    return items


@router.post("", response_model=ApplicationResponse)
async def track_application(
    data: CreateApplicationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Start tracking an opportunity application (e.g. In-Progress, Applied, Claimed)."""
    u_stmt = select(User.id).limit(1)
    user_id = (await db.execute(u_stmt)).scalar()
    if not user_id:
        raise HTTPException(status_code=400, detail="User not initialized")

    opp_stmt = select(Opportunity).where(Opportunity.id == data.opportunity_id)
    opp = (await db.execute(opp_stmt)).scalars().first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Check if already tracking
    existing_stmt = select(Application).where(
        Application.user_id == user_id,
        Application.opportunity_id == data.opportunity_id,
    )
    existing = (await db.execute(existing_stmt)).scalars().first()
    if existing:
        existing.status = data.status
        if data.notes:
            existing.notes = data.notes
        if data.applied_date:
            existing.applied_date = data.applied_date
        await db.commit()
        await db.refresh(existing)
        target = existing
    else:
        app_entry = Application(
            user_id=user_id,
            opportunity_id=data.opportunity_id,
            status=data.status,
            notes=data.notes,
            applied_date=data.applied_date or (datetime.now(timezone.utc) if data.status == "applied" else None),
        )
        db.add(app_entry)
        await db.commit()
        await db.refresh(app_entry)
        target = app_entry

    return ApplicationResponse(
        id=target.id,
        opportunity_id=opp.id,
        opportunity_title=opp.title,
        provider=opp.provider,
        category=opp.category,
        benefit_summary=opp.benefit_summary,
        official_url=opp.official_url,
        status=target.status,
        applied_date=target.applied_date,
        notes=target.notes,
        created_at=target.created_at,
        updated_at=target.updated_at,
    )


@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: int,
    data: UpdateApplicationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update tracked status (e.g. marked as Awarded / Claimed)."""
    stmt = (
        select(Application, Opportunity)
        .join(Opportunity, Application.opportunity_id == Opportunity.id)
        .where(Application.id == app_id)
    )
    row = (await db.execute(stmt)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Tracked application not found")

    app_entry, opp = row
    if data.status:
        app_entry.status = data.status
    if data.notes is not None:
        app_entry.notes = data.notes
    if data.applied_date is not None:
        app_entry.applied_date = data.applied_date

    await db.commit()
    await db.refresh(app_entry)

    return ApplicationResponse(
        id=app_entry.id,
        opportunity_id=opp.id,
        opportunity_title=opp.title,
        provider=opp.provider,
        category=opp.category,
        benefit_summary=opp.benefit_summary,
        official_url=opp.official_url,
        status=app_entry.status,
        applied_date=app_entry.applied_date,
        notes=app_entry.notes,
        created_at=app_entry.created_at,
        updated_at=app_entry.updated_at,
    )


@router.delete("/{app_id}")
async def delete_application(app_id: int, db: AsyncSession = Depends(get_db)):
    """Stop tracking an application."""
    stmt = select(Application).where(Application.id == app_id)
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Application not found")

    await db.delete(item)
    await db.commit()
    return {"status": "deleted", "id": app_id}
