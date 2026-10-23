import html
from datetime import datetime
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import CommandStart, Command
from sqlalchemy import select, or_, and_
from config import settings
from database import async_session, User, Friendship

router = Router()

def get_main_menu_markup():
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="🔋 Открыть Социальную Батарейку",
                web_app=WebAppInfo(url=settings.WEBAPP_URL)
            )
        ],
        [
            InlineKeyboardButton(text="⚡️ Быстрый чек-ин", callback_data="ask_checkin"),
            InlineKeyboardButton(text="👥 Позвать друга", switch_inline_query="Заходи в мою батарейку!")
        ]
    ])

def get_checkin_keyboard():
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔋 100%", callback_data="set_battery:100"),
            InlineKeyboardButton(text="⚡️ 70%", callback_data="set_battery:70"),
        ],
        [
            InlineKeyboardButton(text="🪫 30%", callback_data="set_battery:30"),
            InlineKeyboardButton(text="🔌 0%", callback_data="set_battery:0"),
        ]
    ])

@router.message(CommandStart())
async def handle_start(message: Message):
    sender_name = message.from_user.first_name or "друг"
    print(f"[Bot] Handling /start from user={message.from_user.id} ({message.from_user.username}): text='{message.text}'", flush=True)
    try:
        args = message.text.split()[1] if len(message.text.split()) > 1 else None
        referrer_id = None
        if args and args.startswith("ref_"):
            try:
                referrer_id = int(args.replace("ref_", ""))
            except ValueError:
                pass

        async with async_session() as db:
            # Get or create current user
            me_res = await db.execute(select(User).where(User.telegram_id == message.from_user.id))
            me = me_res.scalar_one_or_none()

            if not me:
                me = User(
                    telegram_id=message.from_user.id,
                    username=message.from_user.username,
                    first_name=sender_name,
                    last_name=message.from_user.last_name,
                    battery_level=80,
                    mood_tag="🔋 В ресурсе",
                    updated_at=datetime.utcnow()
                )
                db.add(me)
                await db.flush()
            else:
                if message.from_user.username:
                    me.username = message.from_user.username
                if message.from_user.first_name:
                    me.first_name = message.from_user.first_name
                if message.from_user.last_name:
                    me.last_name = message.from_user.last_name

            # Connect friendship if referred
            friend_connected_text = ""
            if referrer_id and referrer_id != message.from_user.id:
                ref_res = await db.execute(select(User).where(User.telegram_id == referrer_id))
                referrer = ref_res.scalar_one_or_none()
                if not referrer:
                    referrer = User(
                        telegram_id=referrer_id,
                        first_name="Друг",
                        battery_level=80,
                        mood_tag="🔋 В ресурсе",
                        updated_at=datetime.utcnow()
                    )
                    db.add(referrer)
                    await db.flush()

                # Check existing
                f_check = await db.execute(
                    select(Friendship).where(
                        or_(
                            and_(Friendship.user_id_1 == me.id, Friendship.user_id_2 == referrer.id),
                            and_(Friendship.user_id_1 == referrer.id, Friendship.user_id_2 == me.id)
                        )
                    )
                )
                if not f_check.scalar_one_or_none():
                    new_f = Friendship(user_id_1=me.id, user_id_2=referrer.id, is_close_friend=False)
                    db.add(new_f)
                    ref_safe_name = html.escape(referrer.first_name or "друг")
                    friend_connected_text = f"\n\n🤝 <b>Вы теперь друзья с {ref_safe_name}!</b> Теперь вы видите заряды друг друга."

            await db.commit()

        user_safe_name = html.escape(sender_name)
        welcome_text = (
            f"👋 Привет, <b>{user_safe_name}</b>!\n\n"
            "🔋 <b>Социальная Батарейка</b> помогает понимать настроение и готовность друзей к общению без лишних вопросов.\n\n"
            "• Выставляй свой процент заряда\n"
            "• Следи за радаром друзей\n"
            "• Отправляй быстрые пинги и зови на кофе"
            f"{friend_connected_text}"
        )

        await message.answer(welcome_text, parse_mode="HTML", reply_markup=get_main_menu_markup())
        print(f"[Bot] Successfully answered /start for {message.from_user.id}", flush=True)
    except Exception as e:
        print(f"[Bot Error] handle_start failed: {e}", flush=True)
        # Safe fallback reply
        await message.answer(
            "👋 Привет! Открывай Социальную Батарейку по кнопке ниже:",
            reply_markup=get_main_menu_markup()
        )

@router.message(Command("checkin"))
async def handle_checkin_command(message: Message):
    text = "🔋 <b>Как твоя социальная батарейка сегодня?</b>\nВыбери уровень заряда в один клик:"
    await message.answer(text, parse_mode="HTML", reply_markup=get_checkin_keyboard())

@router.callback_query(F.data == "ask_checkin")
async def callback_ask_checkin(query: CallbackQuery):
    await query.message.edit_text(
        "🔋 <b>Как твоя социальная батарейка прямо сейчас?</b>",
        parse_mode="HTML",
        reply_markup=get_checkin_keyboard()
    )
    await query.answer()

@router.callback_query(F.data.startswith("set_battery:"))
async def callback_set_battery(query: CallbackQuery):
    level = int(query.data.split(":")[1])
    tags_map = {
        100: "🔋 В ресурсе",
        70: "🎉 Готов к движу",
        30: "🪫 Не трогать",
        0: "😴 Сплю / Отдыхаю"
    }
    mood_tag = tags_map.get(level, "В спокойном ритме")

    async with async_session() as db:
        res = await db.execute(select(User).where(User.telegram_id == query.from_user.id))
        user = res.scalar_one_or_none()
        if user:
            user.battery_level = level
            user.mood_tag = mood_tag
            user.updated_at = datetime.utcnow()
            await db.commit()

    await query.answer(f"Твой заряд обновлен: {level}% ({mood_tag})!", show_alert=False)

    markup = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="🔋 Открыть мини-апп",
                web_app=WebAppInfo(url=settings.WEBAPP_URL)
            )
        ]
    ])

    await query.message.edit_text(
        f"✅ <b>Заряд сохранен!</b>\n\nТекущий уровень: <b>{level}%</b>\nСостояние: <i>{mood_tag}</i>",
        parse_mode="HTML",
        reply_markup=markup
    )
