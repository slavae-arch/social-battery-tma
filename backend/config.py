import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
    WEBAPP_URL: str = os.getenv("WEBAPP_URL", "https://social-battery-tma.onrender.com")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./social_battery.db")
    DEV_MODE: bool = os.getenv("DEV_MODE", "False").lower() in ("true", "1", "yes")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
