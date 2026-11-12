import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Base directory for backend
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

class Settings(BaseSettings):
    INTEGRATEIQ_ENV: str = "development"
    PORT: int = 8000
    
    # SQLite Database
    DATABASE_PATH: str = str(BASE_DIR / "integrateiq.db")
    
    # Gemini API Settings (Official Google Gen AI SDK)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # PayPal Sandbox Settings
    PAYPAL_ENV: str = "sandbox"
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_WEBHOOK_ID: Optional[str] = None
    PAYPAL_SANDBOX_URL: str = "https://api-m.sandbox.paypal.com"
    
    # Test Runner Settings
    TEST_TIMEOUT_SECONDS: int = 15
    MAX_OUTPUT_BYTES: int = 65536
    
    class Config:
        env_file = str(ROOT_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
