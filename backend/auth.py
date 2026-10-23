import hmac
import hashlib
import json
import urllib.parse
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from config import settings

def validate_init_data(init_data_raw: str, bot_token: str) -> Optional[Dict[str, Any]]:
    """
    Cryptographically validates Telegram WebApp initData with HMAC-SHA256.
    Returns parsed user dict or None if invalid.
    """
    if settings.DEV_MODE and (not init_data_raw or init_data_raw.startswith("mock")):
        return {
            "id": 7770001,
            "first_name": "Алексей",
            "last_name": "Смирнов",
            "username": "alex_energy",
            "is_dev": True
        }

    try:
        parsed_data = dict(urllib.parse.parse_qsl(init_data_raw, keep_blank_values=True))
        if "hash" not in parsed_data:
            return None

        received_hash = parsed_data.pop("hash")
        # Sort keys alphabetically and format into data_check_string
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))

        # Secret key = HMAC_SHA256("WebAppData", bot_token)
        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if hmac.compare_digest(calculated_hash, received_hash):
            if "user" in parsed_data:
                return json.loads(parsed_data["user"])
            return parsed_data
        return None
    except Exception as e:
        print(f"initData validation error: {e}")
        return None

async def get_current_user(x_telegram_init_data: Optional[str] = Header(None, alias="X-Telegram-Init-Data")) -> Dict[str, Any]:
    """FastAPI Dependency for authenticating TMA requests."""
    user = validate_init_data(x_telegram_init_data or "", settings.BOT_TOKEN)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Telegram initData"
        )
    return user
