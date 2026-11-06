"""API Router Configuration"""
from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.profile import router as profile_router
from app.api.news import router as news_router
from app.api.opportunities import router as opp_router
from app.api.dashboard import router as dashboard_router
from app.api.sources import router as sources_router
from app.api.saved_items import router as saved_router
from app.api.applications import router as app_router
from app.api.notifications import router as notifications_router
from app.api.circular_intelligence import router as circulars_router
from app.api.security_advisories import router as security_router
from app.api.academic_records import router as academic_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(dashboard_router, tags=["Dashboard"])
api_router.include_router(news_router, tags=["News Intelligence"])
api_router.include_router(opp_router, tags=["Opportunity Intelligence"])
api_router.include_router(profile_router, tags=["Profile & Preferences"])
api_router.include_router(sources_router, tags=["Source Registry"])
api_router.include_router(saved_router, tags=["Saved Items"])
api_router.include_router(app_router, tags=["Application Tracker"])
api_router.include_router(notifications_router, tags=["Notifications & Alerts"])
api_router.include_router(circulars_router, tags=["Document & Circular Intelligence"])
api_router.include_router(security_router, tags=["Developer Security Advisories"])
api_router.include_router(academic_router, tags=["Academic Records Simulator"])
