from datetime import datetime
from typing import AsyncGenerator
from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base, relationship
from config import settings

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, index=True, nullable=False)
    username = Column(String(64), nullable=True, index=True)
    first_name = Column(String(128), nullable=False)
    last_name = Column(String(128), nullable=True)
    photo_url = Column(String(512), nullable=True)
    battery_level = Column(Integer, default=80, nullable=False)
    mood_tag = Column(String(64), default="🔋 В ресурсе", nullable=False)
    privacy = Column(String(32), default="all", nullable=False)
    duration = Column(String(32), default="4h", nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    user_id_1 = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    user_id_2 = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    is_close_friend = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_unique_friendship", "user_id_1", "user_id_2", unique=True),
    )

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(64), primary_key=True, index=True)
    telegram_chat_id = Column(BigInteger, nullable=True, index=True)
    title = Column(String(128), nullable=False)
    icon = Column(String(16), default="✨", nullable=False)
    description = Column(String(256), default="", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class RoomMember(Base):
    __tablename__ = "room_members"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String(64), ForeignKey("rooms.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

class PingLog(Base):
    __tablename__ = "ping_logs"

    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(db_url, echo=False)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
