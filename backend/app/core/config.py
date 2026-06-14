from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    APP_NAME: str = "Tata Steel APIS"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://apis_user:apis_password@localhost:5432/apis_db"
    )

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "apis-super-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://tata-steel-apis.vercel.app",
        "https://*.vercel.app",
    ]

    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
