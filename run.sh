#!/usr/bin/env bash

# Скрипт быстрого запуска "Социальной Батарейки"
cd "$(dirname "$0")"

echo "🔋 Запуск Социальной Батарейки..."

# Проверка Node и Python
export PATH="/opt/homebrew/bin:$PATH"

# 1. Запуск бэкенда
echo "🚀 Запуск бэкенда и Telegram-бота..."
cd backend
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Запуск фронтенда
echo "⚡️ Запуск Vite фронтенда..."
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

# 3. Запуск туннеля
echo "🌐 Запуск публичного HTTPS-туннеля..."
ssh -o StrictHostKeyChecking=no -R 80:localhost:5173 nokey@localhost.run &
TUNNEL_PID=$!

echo "✅ Всё успешно запущено!"
echo "👉 Бот: https://t.me/my_social_battery_bot"
echo "Для остановки нажмите Ctrl+C"

trap "kill $BACKEND_PID $FRONTEND_PID $TUNNEL_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
