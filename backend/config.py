import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "mock_bot_token_123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11")
    WEBAPP_URL: str = os.getenv("WEBAPP_URL", "http://localhost:5173")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./social_battery.db")
    DEV_MODE: bool = os.getenv("DEV_MODE", "True").lower() in ("true", "1", "yes")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
