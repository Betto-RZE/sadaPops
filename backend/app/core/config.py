from pydantic_settings import BaseSettings
from typing import List, Union
import json

class Settings(BaseSettings):
    ENV: str = "development"
    PROJECT_NAME: str = "Mapa de Dalias API"
    LOG_LEVEL: str = "info"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgrespassword@localhost:5432/mapa_dalias_db"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]
    LLM_API_KEY: str = "mock_key"
    LLM_MODEL: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
