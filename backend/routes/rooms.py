from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, Room, RoomMember, User
from auth import get_current_user

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

@router.get("")
async def get_user_rooms(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tg_id = current_user.get("id")
    me = (await db.execute(select(User).where(User.telegram_id == tg_id))).scalar_one_or_none()
    if not me:
        return []

    # Get rooms where user is a member
    rm_stmt = select(RoomMember).where(RoomMember.user_id == me.id)
    rm_res = await db.execute(rm_stmt)
    memberships = rm_res.scalars().all()

    rooms_data = []
    for m in memberships:
        r_res = await db.execute(select(Room).where(Room.id == m.room_id))
        room = r_res.scalar_one_or_none()
        if not room:
            continue

        # Get all members of this room
        all_m_stmt = select(User).join(RoomMember, RoomMember.user_id == User.id).where(RoomMember.room_id == room.id)
        users_res = await db.execute(all_m_stmt)
        members = users_res.scalars().all()

        avg_battery = int(sum(u.battery_level for u in members) / len(members)) if members else 0

        rooms_data.append({
            "id": room.id,
            "title": room.title,
            "icon": room.icon,
            "description": room.description,
            "avg_battery": avg_battery,
            "members_count": len(members),
            "members": [
                {
                    "id": u.id,
                    "first_name": u.first_name,
                    "username": u.username,
                    "photo_url": u.photo_url,
                    "battery_level": u.battery_level,
                    "mood_tag": u.mood_tag,
                }
                for u in members
            ]
        })

    return rooms_data
