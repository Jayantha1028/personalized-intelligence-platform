from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import api_router
from app.database.session import init_db
from app.ingestion.scheduler import scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and start autonomous ingestion
    await init_db()
    scheduler.start()
    yield
    # Shutdown logic
    scheduler.stop()


app = FastAPI(
    title=settings.APP_NAME,
    description="Dual-engine platform for personalized news intelligence and verified opportunity matching.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": "/api",
    }
