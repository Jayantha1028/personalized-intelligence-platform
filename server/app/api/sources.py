from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import Source

router = APIRouter(prefix="/sources")


class SourceResponse(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    source_type: str
    base_url: str
    feed_url: Optional[str]
    country: str
    region: str
    trust_level: str
    enabled: bool
    fetch_interval_minutes: int
    last_fetched_at: Optional[datetime]
    last_status: str
    failure_count: int

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[SourceResponse])
async def list_sources(db: AsyncSession = Depends(get_db)):
    """Retrieve all approved information sources and their health metrics."""
    stmt = select(Source).order_by(Source.category, Source.name)
    res = await db.execute(stmt)
    return res.scalars().all()
