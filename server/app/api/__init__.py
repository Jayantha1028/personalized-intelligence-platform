"""API Router Configuration"""
from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.profile import router as profile_router
from app.api.news import router as news_router
from app.api.opportunities import router as opp_router
from app.api.dashboard import router as dashboard_router
from app.api.sources import router as sources_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(dashboard_router, tags=["Dashboard"])
api_router.include_router(news_router, tags=["News Intelligence"])
api_router.include_router(opp_router, tags=["Opportunity Intelligence"])
api_router.include_router(profile_router, tags=["Profile & Preferences"])
api_router.include_router(sources_router, tags=["Source Registry"])
