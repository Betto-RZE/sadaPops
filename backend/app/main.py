from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "env": settings.ENV
    }

@app.get("/api/v1/dalias/aggregate", tags=["Dalias"])
async def get_dalias_aggregate(state_id: str = None):
    # Mock data fallback for development
    return {
        "status": "success",
        "threshold": 5,
        "data": [
            {"state_id": "21", "state_name": "Puebla", "count": 4821, "is_aggregated_to_state": False},
            {"state_id": "09", "state_name": "Ciudad de México", "count": 8940, "is_aggregated_to_state": False},
            {"state_id": "15", "state_name": "Estado de México", "count": 10512, "is_aggregated_to_state": False}
        ]
    }
