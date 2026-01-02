from pydantic_settings import BaseSettings
import secrets

class Settings(BaseSettings):
    DATABASE_URL: str
    
    # JWT Settings
    SECRET_KEY: str = secrets.token_urlsafe(32)  # Auto-generate if not provided
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Short-lived for security
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # Long-lived for seamless UX

    class Config:
        env_file = ".env"

settings = Settings()
