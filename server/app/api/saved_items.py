from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import SavedItem, User, Article, Opportunity

router = APIRouter(prefix="/saved-items")


class CreateSavedItemRequest(BaseModel):
    item_type: str  # "article" or "opportunity"
    item_id: int
    notes: Optional[str] = None


class SavedItemResponse(BaseModel):
    id: int
    item_type: str
    item_id: int
    notes: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    link: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[SavedItemResponse])
async def list_saved_items(db: AsyncSession = Depends(get_db)):
    """Retrieve all bookmarked news articles and opportunities."""
    stmt = select(SavedItem).order_by(desc(SavedItem.created_at))
    res = await db.execute(stmt)
    items = res.scalars().all()

    enriched = []
    for item in items:
        title = None
        category = None
        link = None

        if item.item_type == "article":
            art = (await db.execute(select(Article).where(Article.id == item.item_id))).scalars().first()
            if art:
                title = art.title
                category = art.topic
                link = art.canonical_url
        elif item.item_type == "opportunity":
            opp = (await db.execute(select(Opportunity).where(Opportunity.id == item.item_id))).scalars().first()
            if opp:
                title = opp.title
                category = opp.category
                link = opp.official_url

        enriched.append(
            SavedItemResponse(
                id=item.id,
                item_type=item.item_type,
                item_id=item.item_id,
                notes=item.notes,
                title=title or "Item removed",
                category=category or "General",
                link=link or "#",
                created_at=item.created_at,
            )
        )
    return enriched


@router.post("", response_model=SavedItemResponse)
async def save_item(data: CreateSavedItemRequest, db: AsyncSession = Depends(get_db)):
    """Bookmark an article or opportunity for later review."""
    # Find primary user
    u_stmt = select(User.id).limit(1)
    user_id = (await db.execute(u_stmt)).scalar()
    if not user_id:
        raise HTTPException(status_code=400, detail="User not initialized")

    # Check if already saved
    existing_stmt = select(SavedItem).where(
        SavedItem.user_id == user_id,
        SavedItem.item_type == data.item_type,
        SavedItem.item_id == data.item_id,
    )
    existing = (await db.execute(existing_stmt)).scalars().first()
    if existing:
        return SavedItemResponse(
            id=existing.id,
            item_type=existing.item_type,
            item_id=existing.item_id,
            notes=existing.notes,
            created_at=existing.created_at,
        )

    saved = SavedItem(
        user_id=user_id,
        item_type=data.item_type,
        item_id=data.item_id,
        notes=data.notes,
    )
    db.add(saved)
    await db.commit()
    await db.refresh(saved)
    return SavedItemResponse(
        id=saved.id,
        item_type=saved.item_type,
        item_id=saved.item_id,
        notes=saved.notes,
        created_at=saved.created_at,
    )


@router.delete("/{saved_id}")
async def delete_saved_item(saved_id: int, db: AsyncSession = Depends(get_db)):
    """Remove item from bookmarks."""
    stmt = select(SavedItem).where(SavedItem.id == saved_id)
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Saved item not found")

    await db.delete(item)
    await db.commit()
    return {"status": "deleted", "id": saved_id}
