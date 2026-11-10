from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.ingestion.scheduler import scheduler

router = APIRouter(prefix="/scheduler")


class SchedulerConfigRequest(BaseModel):
    interval_minutes: Optional[int] = None
    enabled: Optional[bool] = None


@router.get("/status")
async def get_scheduler_status():
    """Retrieve autonomous scheduler health, runtime metrics, and next scheduled execution."""
    return scheduler.get_status()


@router.post("/trigger")
async def trigger_autonomous_sync(background_tasks: BackgroundTasks):
    """Trigger an autonomous sync cycle immediately in background."""
    if scheduler.is_syncing:
        return {"status": "already_running", "message": "Autonomous sync cycle is already executing."}

    background_tasks.add_task(scheduler.execute_sync_cycle)
    return {
        "status": "triggered",
        "message": "Autonomous background sync cycle successfully dispatched.",
    }


@router.post("/config")
async def configure_scheduler(data: SchedulerConfigRequest):
    """Adjust scheduler interval or toggle enabled state."""
    if data.interval_minutes is not None:
        if data.interval_minutes < 5 or data.interval_minutes > 1440:
            raise HTTPException(status_code=400, detail="Interval must be between 5 and 1440 minutes (24h).")
        scheduler.interval_minutes = data.interval_minutes

    if data.enabled is not None:
        if data.enabled and not scheduler.is_running:
            scheduler.start()
        elif not data.enabled and scheduler.is_running:
            scheduler.stop()

    return scheduler.get_status()
