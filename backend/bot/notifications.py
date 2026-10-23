from typing import Optional
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from config import settings

bot_instance: Optional[Bot] = None

def set_bot_instance(bot: Bot):
    global bot_instance
    bot_instance = bot

async def send_bot_ping_notification(
    to_chat_id: int,
    sender_name: str,
    sender_battery: int,
    message: str
) -> bool:
    """Sends a Telegram bot message when a friend pings user."""
    if not bot_instance or settings.DEV_MODE:
        print(f"[Dev Bot Ping] To: {to_chat_id} | From: {sender_name} ({sender_battery}%) | Msg: {message}")
        return True

    try:
        text = (
            f"⚡️ <b>{sender_name}</b> видит твой статус и присылает пинг:\n\n"
            f"<i>«{message}»</i>\n\n"
            f"Заряд друга: <b>{sender_battery}%</b>"
        )
        markup = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🔋 Открыть Батарейку",
                    web_app=WebAppInfo(url=settings.WEBAPP_URL)
                )
            ]
        ])
        await bot_instance.send_message(chat_id=to_chat_id, text=text, parse_mode="HTML", reply_markup=markup)
        return True
    except Exception as e:
        print(f"Error sending bot ping notification: {e}")
        return False

async def send_smart_match_notification(user1_id: int, user2_id: int, user1_name: str, user2_name: str):
    """Sends Smart Match notification to both users when both are >80%."""
    if not bot_instance or settings.DEV_MODE:
        print(f"[Dev Smart Match] {user1_name} ({user1_id}) <-> {user2_name} ({user2_id})")
        return

    text_template = (
        "🔥 <b>Умный матчинг!</b>\n\n"
        "У тебя и {friend_name} прямо сейчас полный заряд социальной энергии (>80%)! 🚀\n"
        "Кажется, это идеальный знак выбраться на кофе или затусить вместе!"
    )
    markup = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔋 Открыть радар", web_app=WebAppInfo(url=settings.WEBAPP_URL))
        ]
    ])

    try:
        await bot_instance.send_message(
            chat_id=user1_id,
            text=text_template.format(friend_name=user2_name),
            parse_mode="HTML",
            reply_markup=markup
        )
        await bot_instance.send_message(
            chat_id=user2_id,
            text=text_template.format(friend_name=user1_name),
            parse_mode="HTML",
            reply_markup=markup
        )
    except Exception as e:
        print(f"Error sending smart match: {e}")
