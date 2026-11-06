import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.config import settings
from app.database.models import Notification, Opportunity, OpportunityMatch, Article, User


class NotificationDispatcher:
    """
    Handles generation, idempotency filtering, and delivery of user notifications
    across In-App and external channels (Telegram / Email).
    """

    def __init__(self):
        self.telegram_token = settings.TELEGRAM_BOT_TOKEN
        self.telegram_chat_id = settings.TELEGRAM_CHAT_ID

    async def scan_and_generate_alerts(self, db: AsyncSession, user_id: int) -> List[Dict[str, Any]]:
        """
        Scans for:
        1. Urgent approaching deadlines (within 14 days)
        2. High-fit matched opportunities (>= 90% fit)
        3. Generates idempotent in-app and external notification records
        """
        now = datetime.now(timezone.utc)
        created_notifications = []

        # 1. Approaching Deadlines Check
        opp_stmt = (
            select(Opportunity, OpportunityMatch.match_status)
            .join(OpportunityMatch, Opportunity.id == OpportunityMatch.opportunity_id)
            .where(
                and_(
                    OpportunityMatch.user_id == user_id,
                    Opportunity.application_deadline != None,
                    Opportunity.status == "open",
                )
            )
        )
        opp_rows = (await db.execute(opp_stmt)).all()

        for opp, match_status in opp_rows:
            deadline = opp.application_deadline
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)

            days_left = (deadline - now).total_seconds() / 86400.0
            if 0 < days_left <= 14:
                urgency_tag = "7d" if days_left <= 7 else "14d"
                idempotency_key = f"deadline-{opp.id}-{urgency_tag}-{now.strftime('%Y-%m')}"

                # Check if already notified
                existing = await db.execute(
                    select(Notification.id).where(Notification.idempotency_key == idempotency_key)
                )
                if not existing.scalar():
                    notif = Notification(
                        user_id=user_id,
                        title=f"⏳ Deadline Alert: {opp.title[:60]}",
                        message=f"{opp.title} closes in {int(days_left)} days ({deadline.strftime('%d %b %Y')}). Your match status is {match_status}.",
                        notification_type="deadline_approaching",
                        reference_type="opportunity",
                        reference_id=opp.id,
                        channel="telegram" if self.telegram_token and self.telegram_chat_id else "in_app",
                        idempotency_key=idempotency_key,
                    )
                    db.add(notif)
                    created_notifications.append(notif)

        # 2. High-fit Match Alerts
        match_stmt = (
            select(Opportunity, OpportunityMatch.fit_score)
            .join(OpportunityMatch, Opportunity.id == OpportunityMatch.opportunity_id)
            .where(
                and_(
                    OpportunityMatch.user_id == user_id,
                    OpportunityMatch.match_status == "MATCHED",
                    OpportunityMatch.fit_score >= 0.90,
                )
            )
        )
        match_rows = (await db.execute(match_stmt)).all()

        for opp, fit_score in match_rows:
            idempotency_key = f"high-fit-match-{opp.id}-user-{user_id}"
            existing = await db.execute(
                select(Notification.id).where(Notification.idempotency_key == idempotency_key)
            )
            if not existing.scalar():
                notif = Notification(
                    user_id=user_id,
                    title=f"🎯 High-Fit Match ({(fit_score * 100):.0f}%): {opp.title[:60]}",
                    message=f"You strictly qualify for {opp.title} by {opp.provider}. Estimated benefit: {opp.benefit_summary or f'₹{opp.benefit_amount:,.0f}'}.",
                    notification_type="match_found",
                    reference_type="opportunity",
                    reference_id=opp.id,
                    channel="in_app",
                    idempotency_key=idempotency_key,
                )
                db.add(notif)
                created_notifications.append(notif)

        if created_notifications:
            await db.commit()
            # Dispatch to Telegram if configured
            for n in created_notifications:
                if self.telegram_token and self.telegram_chat_id:
                    await self._send_telegram(f"*{n.title}*\n\n{n.message}")

        return [
            {
                "id": n.id,
                "title": n.title,
                "type": n.notification_type,
                "channel": n.channel,
            }
            for n in created_notifications
        ]

    async def _send_telegram(self, text: str) -> bool:
        """Send message via Telegram Bot API."""
        if not self.telegram_token or not self.telegram_chat_id:
            return False
        url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json={
                    "chat_id": self.telegram_chat_id,
                    "text": text,
                    "parse_mode": "Markdown",
                })
                return res.status_code == 200
        except Exception:
            return False
