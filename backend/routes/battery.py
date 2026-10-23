from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, User, Friendship
from auth import get_current_user

router = APIRouter(prefix="/api/battery", tags=["Battery"])

class BatteryUpdateRequest(BaseModel):
    battery_level: int = Field(ge=0, le=100)
    mood_tag: str
    privacy: str = "all"
    duration: str = "4h"

@router.get("/me")
async def get_my_status(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tg_id = current_user.get("id")
    result = await db.execute(select(User).where(User.telegram_id == tg_id))
    user = result.scalar_one_or_none()

    if not user:
        # Auto-create user on first TMA launch
        user = User(
            telegram_id=tg_id,
            username=current_user.get("username"),
            first_name=current_user.get("first_name", "Пользователь"),
            last_name=current_user.get("last_name"),
            photo_url=current_user.get("photo_url"),
            battery_level=80,
            mood_tag="🔋 В ресурсе",
            privacy="all",
            duration="4h",
            updated_at=datetime.utcnow(),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return {
        "id": user.id,
        "telegram_id": user.telegram_id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "photo_url": user.photo_url,
        "battery_level": user.battery_level,
        "mood_tag": user.mood_tag,
        "privacy": user.privacy,
        "duration": user.duration,
        "updated_at": user.updated_at.isoformat(),
    }

@router.post("")
async def update_battery_status(
    payload: BatteryUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tg_id = current_user.get("id")
    result = await db.execute(select(User).where(User.telegram_id == tg_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            telegram_id=tg_id,
            username=current_user.get("username"),
            first_name=current_user.get("first_name", "Пользователь"),
            last_name=current_user.get("last_name"),
            photo_url=current_user.get("photo_url"),
            battery_level=payload.battery_level,
            mood_tag=payload.mood_tag,
            privacy=payload.privacy,
            duration=payload.duration,
            updated_at=datetime.utcnow(),
        )
        db.add(user)
    else:
        user.battery_level = payload.battery_level
        user.mood_tag = payload.mood_tag
        user.privacy = payload.privacy
        user.duration = payload.duration
        user.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(user)

    # Check for Smart Matching (>80% simultaneous for close friends)
    matched_friends = []
    if payload.battery_level >= 80:
        # Find close friends who are also >= 80%
        friend_stmt = select(User).join(
            Friendship,
            ((Friendship.user_id_1 == user.id) & (Friendship.user_id_2 == User.id)) |
            ((Friendship.user_id_2 == user.id) & (Friendship.user_id_1 == User.id))
        ).where(
            Friendship.is_close_friend == True,
            User.battery_level >= 80
        )
        friends_res = await db.execute(friend_stmt)
        matched_friends = [
            {"id": f.id, "telegram_id": f.telegram_id, "first_name": f.first_name, "battery_level": f.battery_level}
            for f in friends_res.scalars().all()
        ]

    return {
        "status": "ok",
        "battery_level": user.battery_level,
        "mood_tag": user.mood_tag,
        "smart_matches": matched_friends
    }
