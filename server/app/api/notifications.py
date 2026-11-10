from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, update
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.database.models import Notification, User, UserProfile
from app.notifications.dispatcher import NotificationDispatcher
from app.config import settings

router = APIRouter(prefix="/notifications")


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    is_read: bool
    channel: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    unread_count: int
    items: List[NotificationResponse]


@router.get("", response_model=NotificationListResponse)
async def list_notifications(db: AsyncSession = Depends(get_db)):
    """Retrieve user notifications and unread alert count."""
    u_stmt = select(User.id).limit(1)
    user_id = (await db.execute(u_stmt)).scalar()
    if not user_id:
        return NotificationListResponse(unread_count=0, items=[])

    # Unread count
    cnt_stmt = select(func.count(Notification.id)).where(
        Notification.user_id == user_id, Notification.is_read == False
    )
    unread_count = (await db.execute(cnt_stmt)).scalar() or 0

    # Items
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(desc(Notification.created_at))
        .limit(50)
    )
    res = await db.execute(stmt)
    items = res.scalars().all()

    return NotificationListResponse(
        unread_count=unread_count,
        items=items,
    )


@router.post("/dispatch")
async def trigger_notification_scan(db: AsyncSession = Depends(get_db)):
    """Trigger background scan for upcoming deadlines and new high-fit opportunities."""
    u_stmt = select(User.id).limit(1)
    user_id = (await db.execute(u_stmt)).scalar()
    if not user_id:
        raise HTTPException(status_code=400, detail="User not initialized")

    dispatcher = NotificationDispatcher()
    dispatched = await dispatcher.scan_and_generate_alerts(db, user_id)
    return {
        "status": "success",
        "newly_generated_alerts": len(dispatched),
        "alerts": dispatched,
    }


@router.put("/{notif_id}/read")
async def mark_as_read(notif_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a single notification as read."""
    stmt = select(Notification).where(Notification.id == notif_id)
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found")

    item.is_read = True
    await db.commit()
    return {"status": "success", "id": notif_id, "is_read": True}


@router.put("/read-all")
async def mark_all_as_read(db: AsyncSession = Depends(get_db)):
    """Mark all notifications as read."""
    u_stmt = select(User.id).limit(1)
    user_id = (await db.execute(u_stmt)).scalar()
    if user_id:
        await db.execute(
            update(Notification)
            .where(Notification.user_id == user_id)
            .values(is_read=True)
        )
        await db.commit()
    return {"status": "success"}


class TelegramTestRequest(BaseModel):
    bot_token: Optional[str] = None
    chat_id: Optional[str] = None
    custom_message: Optional[str] = None


class TelegramConfigRequest(BaseModel):
    bot_token: str
    chat_id: str
    enabled: bool = True


@router.get("/telegram/config")
async def get_telegram_config(db: AsyncSession = Depends(get_db)):
    """Retrieve current Telegram bot configuration state (token is masked)."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    masked_token = f"{token[:6]}...{token[-4:]}" if token and len(token) > 10 else ("Configured" if token else "")
    return {
        "is_configured": bool(token and chat_id),
        "bot_token_preview": masked_token,
        "chat_id": chat_id or "",
        "channels": ["in_app", "telegram"],
    }


@router.post("/telegram/test")
async def test_telegram_alert(data: TelegramTestRequest):
    """Dispatch a test message to the specified or configured Telegram bot and chat."""
    dispatcher = NotificationDispatcher()
    result = await dispatcher.test_telegram_connection(
        token=data.bot_token,
        chat_id=data.chat_id,
        message=data.custom_message,
    )
    return result


@router.post("/telegram/config")
async def save_telegram_config(data: TelegramConfigRequest, db: AsyncSession = Depends(get_db)):
    """Update runtime Telegram bot token and chat ID."""
    settings.TELEGRAM_BOT_TOKEN = data.bot_token.strip()
    settings.TELEGRAM_CHAT_ID = data.chat_id.strip()

    # Also persist in user profile preferences if available
    profile_stmt = select(UserProfile)
    profile = (await db.execute(profile_stmt)).scalars().first()
    if profile:
        prefs = dict(profile.preferences or {})
        prefs["telegram_chat_id"] = data.chat_id.strip()
        prefs["telegram_alerts_enabled"] = data.enabled
        profile.preferences = prefs
        await db.commit()

    return {
        "status": "success",
        "message": "Telegram notification settings updated successfully.",
        "is_configured": bool(settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID),
    }
