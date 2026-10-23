import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from aiogram import Bot, Dispatcher
from config import settings
from database import init_db, async_session, User, Friendship, Room, RoomMember
from routes import battery, friends, pings, rooms
from bot.handlers import router as bot_router
from bot.inline import router as inline_router
from bot.notifications import set_bot_instance
from sqlalchemy import select

bot: Bot = None
dp: Dispatcher = None
bot_task: asyncio.Task = None

async def seed_initial_data():
    """Seeds initial mock friends and groups if empty."""
    async with async_session() as db:
        users_count = (await db.execute(select(User))).scalars().all()
        if len(users_count) == 0:
            mock_users = [
                User(id=1, telegram_id=7770001, username="alex_energy", first_name="Алексей", last_name="Смирнов", battery_level=85, mood_tag="🔋 В ресурсе"),
                User(id=2, telegram_id=1001, username="dima_sky", first_name="Дима", last_name="Воронов", battery_level=92, mood_tag="☕️ Хочу кофе"),
                User(id=3, telegram_id=1002, username="anya_art", first_name="Аня", last_name="Ковалева", battery_level=85, mood_tag="🎉 Готов к движу"),
                User(id=4, telegram_id=1003, username="misha_code", first_name="Михаил", last_name="Петухов", battery_level=60, mood_tag="💻 В потоке"),
                User(id=5, telegram_id=1004, username="katya_music", first_name="Катя", last_name="Рябова", battery_level=25, mood_tag="🪫 Не трогать"),
                User(id=6, telegram_id=1005, username="ilya_dev", first_name="Илья", last_name="Кузнецов", battery_level=15, mood_tag="😴 Сплю / Отдыхаю"),
            ]
            for u in mock_users:
                db.add(u)
            await db.flush()

            # Friendships with user 1 (Alex)
            friendships = [
                Friendship(user_id_1=1, user_id_2=2, is_close_friend=True),
                Friendship(user_id_1=1, user_id_2=3, is_close_friend=True),
                Friendship(user_id_1=1, user_id_2=4, is_close_friend=False),
                Friendship(user_id_1=1, user_id_2=5, is_close_friend=True),
                Friendship(user_id_1=1, user_id_2=6, is_close_friend=False),
            ]
            for f in friendships:
                db.add(f)

            # Initial room
            room = Room(id="room_besties", title="Лучшие друзья", icon="✨", description="Наш уютный ближний круг")
            db.add(room)
            await db.flush()

            room_members = [
                RoomMember(room_id="room_besties", user_id=1),
                RoomMember(room_id="room_besties", user_id=2),
                RoomMember(room_id="room_besties", user_id=3),
                RoomMember(room_id="room_besties", user_id=5),
            ]
            for rm in room_members:
                db.add(rm)

            await db.commit()
            print("[DB] Initial mock database seeded successfully.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global bot, dp, bot_task
    # Startup: Database
    await init_db()
    await seed_initial_data()

    # Startup: Telegram Bot (Webhook on HTTPS, Polling on local dev)
    if settings.BOT_TOKEN and not settings.BOT_TOKEN.startswith("mock_"):
        try:
            bot = Bot(token=settings.BOT_TOKEN)
            set_bot_instance(bot)
            dp = Dispatcher()
            dp.include_router(bot_router)
            dp.include_router(inline_router)

            is_https = settings.WEBAPP_URL and settings.WEBAPP_URL.startswith("https://")
            if is_https:
                webhook_url = f"{settings.WEBAPP_URL.rstrip('/')}/api/webhook"
                print(f"[Bot] Configuring Telegram Webhook: {webhook_url}", flush=True)
                await bot.set_webhook(
                    url=webhook_url,
                    allowed_updates=["message", "callback_query", "inline_query"],
                    drop_pending_updates=False
                )
                info = await bot.get_webhook_info()
                print(f"[Bot] Webhook established: {info.url} (pending updates: {info.pending_update_count})", flush=True)
            else:
                try:
                    await bot.delete_webhook(drop_pending_updates=False)
                except Exception as e:
                    print(f"[Bot Warning] delete_webhook: {e}", flush=True)

                async def start_bot_polling():
                    while True:
                        try:
                            print("[Bot] Telegram bot polling started.", flush=True)
                            await dp.start_polling(bot, allowed_updates=["message", "callback_query", "inline_query"])
                        except asyncio.CancelledError:
                            print("[Bot] Polling cancelled.", flush=True)
                            break
                        except Exception as e:
                            print(f"[Bot Error] Polling crashed: {e}. Retrying in 5s...", flush=True)
                            await asyncio.sleep(5)

                bot_task = asyncio.create_task(start_bot_polling())
        except Exception as e:
            print(f"[Bot Warning] Could not initialize bot: {e}", flush=True)
    else:
        print("[Bot Info] Running in DEV mode with simulated bot responses.", flush=True)

    yield

    # Shutdown
    if bot_task:
        bot_task.cancel()
        try:
            await bot_task
        except asyncio.CancelledError:
            pass
    if bot:
        await bot.session.close()

app = FastAPI(
    title="Social Battery Telegram Mini App API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for WebApp
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Telegram Webhook Endpoint
@app.post("/api/webhook")
async def telegram_webhook(request: Request):
    if not bot or not dp:
        return Response(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content="Bot not initialized")
    try:
        update_data = await request.json()
        await dp.feed_webhook_update(bot, update_data)
        return {"ok": True}
    except Exception as e:
        print(f"[Webhook Error] {e}", flush=True)
        return {"ok": False, "error": str(e)}

@app.get("/api/bot-info")
async def bot_info():
    if not bot:
        return {"status": "no bot initialized"}
    try:
        me = await bot.get_me()
        webhook = await bot.get_webhook_info()
        return {
            "bot": {
                "id": me.id,
                "username": me.username,
                "first_name": me.first_name
            },
            "webhook": {
                "url": webhook.url,
                "pending_update_count": webhook.pending_update_count,
                "last_error_date": webhook.last_error_date,
                "last_error_message": webhook.last_error_message
            }
        }
    except Exception as e:
        return {"error": str(e)}

# Include API Routers
app.include_router(battery.router)
app.include_router(friends.router)
app.include_router(pings.router)
app.include_router(rooms.router)

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

# Mount frontend static files in production
import os
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))
if not os.path.exists(frontend_dist):
    frontend_dist = os.path.abspath("/app/frontend/dist")

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "API route not found"}
        target = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    async def root():
        return {"app": "Social Battery TMA API", "status": "online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
