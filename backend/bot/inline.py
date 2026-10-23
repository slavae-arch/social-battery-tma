import uuid
from aiogram import Router
from aiogram.types import InlineQuery, InlineQueryResultArticle, InputTextMessageContent, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from sqlalchemy import select
from config import settings
from database import async_session, User

router = Router()

@router.inline_query()
async def handle_inline_query(inline_query: InlineQuery):
    async with async_session() as db:
        res = await db.execute(select(User).where(User.telegram_id == inline_query.from_user.id))
        user = res.scalar_one_or_none()

    level = user.battery_level if user else 85
    tag = user.mood_tag if user else "🔋 В ресурсе"

    emoji = "🔋" if level >= 80 else ("⚡️" if level >= 50 else ("🪫" if level >= 20 else "🔌"))

    text_content = (
        f"{emoji} <b>Моя социальная батарейка: {level}%</b>\n"
        f"Текущее состояние: <i>{tag}</i>\n\n"
        f"Узнай заряд своих друзей в приложении 👇"
    )

    markup = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="⚡️ Проверить свой заряд",
                web_app=WebAppInfo(url=f"{settings.WEBAPP_URL}?startapp=ref_{inline_query.from_user.id}")
            )
        ]
    ])

    result_article = InlineQueryResultArticle(
        id=str(uuid.uuid4()),
        title=f"{emoji} Мой заряд: {level}% ({tag})",
        description="Отправить карточку своего текущего настроения в этот чат",
        input_message_content=InputTextMessageContent(
            message_text=text_content,
            parse_mode="HTML"
        ),
        reply_markup=markup
    )

    await inline_query.answer(
        results=[result_article],
        cache_time=10,
        is_personal=True
    )
