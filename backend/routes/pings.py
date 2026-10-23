from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, User, PingLog
from auth import get_current_user

router = APIRouter(prefix="/api/ping", tags=["Pings"])

class PingSendRequest(BaseModel):
    friend_telegram_id: int
    message: str

@router.post("")
async def send_ping(
    payload: PingSendRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sender_tg_id = current_user.get("id")
    sender_name = current_user.get("first_name", "Твой друг")

    sender = (await db.execute(select(User).where(User.telegram_id == sender_tg_id))).scalar_one_or_none()
    receiver = (await db.execute(select(User).where(User.telegram_id == payload.friend_telegram_id))).scalar_one_or_none()

    if not sender or not receiver:
        raise HTTPException(status_code=404, detail="User not found")

    # Record ping
    log = PingLog(
        from_user_id=sender.id,
        to_user_id=receiver.id,
        message=payload.message,
        created_at=datetime.utcnow()
    )
    db.add(log)
    await db.commit()

    # Bot notification logic will be invoked if bot instance is initialized
    from bot.notifications import send_bot_ping_notification
    sent = await send_bot_ping_notification(
        to_chat_id=receiver.telegram_id,
        sender_name=sender_name,
        sender_battery=sender.battery_level,
        message=payload.message
    )

    return {
        "status": "ok",
        "delivered": sent,
        "detail": f"Ping sent to {receiver.first_name}"
    }
