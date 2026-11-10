from typing import List, Union
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json

_ROOT_DB = Path(__file__).resolve().parent.parent.parent / "platform.db"
_DEFAULT_DB_URL = f"sqlite+aiosqlite:///{_ROOT_DB}" if _ROOT_DB.exists() else "sqlite+aiosqlite:///./platform.db"


class Settings(BaseSettings):
    APP_NAME: str = "Personal Intelligence & Opportunities Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "temporary-dev-secret-key-replace-in-production-12345"
    
    # Database URL: default to SQLite for instant local dev, switch to postgres+asyncpg in .env
    DATABASE_URL: str = _DEFAULT_DB_URL
    
    # CORS Origins
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:5000",
    ]
    
    # Optional LLM Key
    GEMINI_API_KEY: str = ""

    # Optional Notification Channels
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    EMAIL_NOTIFICATIONS_ENABLED: bool = False
    
    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return ["*"]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
