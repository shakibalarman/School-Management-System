"""FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1 import api_router
from app.core.config import settings
from app.core.database import engine

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


@app.get("/ready", tags=["health"])
def ready():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready", "db": "up"}
    except Exception as exc:
        return {"status": "degraded", "db": "down", "detail": str(exc)[:300]}
