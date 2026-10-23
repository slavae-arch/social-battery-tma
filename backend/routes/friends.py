from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from database import get_db, User, Friendship
from auth import get_current_user

router = APIRouter(prefix="/api/friends", tags=["Friends"])

class InviteRequest(BaseModel):
    referrer_telegram_id: int

class ToggleCloseRequest(BaseModel):
    friend_id: int

def format_time_ago(updated_at: datetime) -> str:
    diff = datetime.utcnow() - updated_at
    minutes = int(diff.total_seconds() // 60)
    if minutes < 1:
        return "только что"
    if minutes < 60:
        return f"{minutes} мин назад"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} ч назад"
    days = hours // 24
    return f"{days} д назад"

@router.get("")
async def get_friends_list(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tg_id = current_user.get("id")
    me_res = await db.execute(select(User).where(User.telegram_id == tg_id))
    me = me_res.scalar_one_or_none()

    if not me:
        return []

    # Get all friendships involving me
    f_stmt = select(Friendship).where(
        or_(Friendship.user_id_1 == me.id, Friendship.user_id_2 == me.id)
    )
    f_res = await db.execute(f_stmt)
    friendships = f_res.scalars().all()

    friends_data = []
    for f in friendships:
        friend_db_id = f.user_id_2 if f.user_id_1 == me.id else f.user_id_1
        fr_res = await db.execute(select(User).where(User.id == friend_db_id))
        fr = fr_res.scalar_one_or_none()
        if not fr:
            continue

        # Respect privacy setting ("close_friends")
        if fr.privacy == "close_friends" and not f.is_close_friend:
            continue

        friends_data.append({
            "id": fr.id,
            "telegram_id": fr.telegram_id,
            "username": fr.username,
            "first_name": fr.first_name,
            "last_name": fr.last_name,
            "photo_url": fr.photo_url,
            "battery_level": fr.battery_level,
            "mood_tag": fr.mood_tag,
            "is_close_friend": f.is_close_friend,
            "updated_at": fr.updated_at.isoformat(),
            "updated_ago": format_time_ago(fr.updated_at),
        })

    return friends_data

@router.post("/invite")
async def process_invite(
    payload: InviteRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tg_id = current_user.get("id")
    if tg_id == payload.referrer_telegram_id:
        return {"status": "ignored", "detail": "Cannot friend yourself"}

    # Get or create current user
    me_res = await db.execute(select(User).where(User.telegram_id == tg_id))
    me = me_res.scalar_one_or_none()
    if not me:
        me = User(
            telegram_id=tg_id,
            username=current_user.get("username"),
            first_name=current_user.get("first_name", "Пользователь"),
            battery_level=80,
            mood_tag="🔋 В ресурсе",
        )
        db.add(me)
        await db.flush()

    # Get referrer
    ref_res = await db.execute(select(User).where(User.telegram_id == payload.referrer_telegram_id))
    ref = ref_res.scalar_one_or_none()
    if not ref:
        return {"status": "error", "detail": "Referrer not found"}

    # Check existing friendship
    existing_f = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.user_id_1 == me.id, Friendship.user_id_2 == ref.id),
                and_(Friendship.user_id_1 == ref.id, Friendship.user_id_2 == me.id)
            )
        )
    )
    if not existing_f.scalar_one_or_none():
        new_f = Friendship(user_id_1=me.id, user_id_2=ref.id, is_close_friend=False)
        db.add(new_f)
        await db.commit()

    return {"status": "ok", "friend_name": ref.first_name}

@router.post("/toggle_close")
async def toggle_close_friend(
    payload: ToggleCloseRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tg_id = current_user.get("id")
    me = (await db.execute(select(User).where(User.telegram_id == tg_id))).scalar_one_or_none()
    if not me:
        raise HTTPException(status_code=404, detail="User not found")

    f_stmt = select(Friendship).where(
        or_(
            and_(Friendship.user_id_1 == me.id, Friendship.user_id_2 == payload.friend_id),
            and_(Friendship.user_id_1 == payload.friend_id, Friendship.user_id_2 == me.id)
        )
    )
    friendship = (await db.execute(f_stmt)).scalar_one_or_none()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")

    friendship.is_close_friend = not friendship.is_close_friend
    await db.commit()
    return {"status": "ok", "is_close_friend": friendship.is_close_friend}
