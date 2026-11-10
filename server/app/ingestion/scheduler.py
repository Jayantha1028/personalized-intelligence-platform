import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from app.database.session import async_session_maker
from app.ingestion.pipeline import IngestionPipeline
from app.notifications.dispatcher import NotificationDispatcher
from app.database.models import User
from sqlalchemy import select

logger = logging.getLogger("autonomous_scheduler")


class AutonomousScheduler:
    """
    Autonomous background worker that periodically triggers:
    1. News and Opportunity Feed Ingestion across all enabled sources
    2. Deadline urgency scanning and notification dispatching
    3. Feed health status monitoring
    """

    def __init__(self, interval_minutes: int = 30):
        self.interval_minutes = interval_minutes
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self.last_sync_time: Optional[datetime] = None
        self.next_run_time: Optional[datetime] = None
        self.last_sync_result: Optional[Dict[str, Any]] = None
        self.sync_count: int = 0
        self.is_syncing: bool = False

    def start(self):
        if self.is_running and self._task and not self._task.done():
            return
        self.is_running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info(f"Autonomous Ingestion Scheduler started (Interval: {self.interval_minutes}m)")

    def stop(self):
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
            logger.info("Autonomous Ingestion Scheduler stopped.")

    async def _run_loop(self):
        while self.is_running:
            try:
                self.next_run_time = datetime.now(timezone.utc) + timedelta(minutes=self.interval_minutes)
                # Run sync job
                await self.execute_sync_cycle()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Scheduler loop error: {e}", exc_info=True)

            try:
                await asyncio.sleep(self.interval_minutes * 60)
            except asyncio.CancelledError:
                break

    async def execute_sync_cycle(self) -> Dict[str, Any]:
        """Executes a single end-to-end sync and alert check."""
        if self.is_syncing:
            return {"status": "in_progress", "message": "Sync cycle already running"}

        self.is_syncing = True
        start_time = datetime.now(timezone.utc)
        result: Dict[str, Any] = {
            "started_at": start_time.isoformat(),
            "pipeline": None,
            "alerts_generated": 0,
            "status": "success",
        }

        try:
            async with async_session_maker() as db:
                # 1. Run feed ingestion
                pipeline = IngestionPipeline()
                pipeline_res = await pipeline.run_all_sources(db=db, max_items_per_source=3)
                result["pipeline"] = pipeline_res

                # 2. Scan and dispatch alerts for all active users
                dispatcher = NotificationDispatcher()
                users_res = await db.execute(select(User.id).where(User.is_active == True))
                user_ids = users_res.scalars().all()

                total_alerts = 0
                for uid in user_ids:
                    alerts = await dispatcher.scan_and_generate_alerts(db, uid)
                    total_alerts += len(alerts)

                result["alerts_generated"] = total_alerts

            self.last_sync_time = datetime.now(timezone.utc)
            self.sync_count += 1
            self.last_sync_result = result
        except Exception as e:
            logger.error(f"Error during autonomous sync cycle: {e}", exc_info=True)
            result["status"] = "error"
            result["error"] = str(e)
            self.last_sync_result = result
        finally:
            self.is_syncing = False

        return result

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "is_syncing": self.is_syncing,
            "interval_minutes": self.interval_minutes,
            "sync_count": self.sync_count,
            "last_sync_time": self.last_sync_time.isoformat() if self.last_sync_time else None,
            "next_run_time": self.next_run_time.isoformat() if self.next_run_time else None,
            "last_sync_result": self.last_sync_result,
        }


# Global singleton scheduler instance
scheduler = AutonomousScheduler(interval_minutes=30)
