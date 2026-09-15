"""Application settings loaded from environment variables."""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "School Management System"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+psycopg://shakibalarman:CHANGE_ME@localhost:5432/sms_db"

    JWT_SECRET_KEY: str = "CHANGE_ME_generate_a_long_random_string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    BACKEND_CORS_ORIGINS: list[str] | str = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def split_cors(cls, v: object) -> list[str] | str:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v  # type: ignore[return-value]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
