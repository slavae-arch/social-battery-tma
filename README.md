# 🔋 Социальная Батарейка (Telegram Mini App)

Полноценное приложение Telegram Mini App (TMA) + Telegram-бот для отслеживания уровня социальной энергии, настроения и готовности к общению среди друзей и компаний.

---

## 🌟 Ключевые возможности

1. **Интерактивный статус (WebApp):**
   * Анимированная 3D/неоновая батарейка с плавным изменением цвета (от ярко-зеленого 🟢 к красному 🔴).
   * Ползунок заряда (0–100%) с **тактильным откликом (HapticFeedback)**.
   * Выбор тегов настроения (*«В ресурсе»*, *«Хочу кофе»*, *«Готов к движу»*, *«Не трогать»*, *«В потоке»*).
   * Таймер сброса статуса (2ч, 4ч, до утра, бессрочно).
   * Настройки приватности (*«Все друзья»* или *«Только близкие ⭐️»*).
   * Генерация плашки для публикации в **Telegram Stories** (`shareToStory`).
   * Кнопка выноса ярлыка приложения на экран телефона (`addToHomeScreen`).

2. **Радар друзей:**
   * Лента друзей с их текущим зарядом, тегами и временем последнего обновления.
   * Фильтры: *«Все»*, *«Готовы к движу (>70%)»*, *«Близкие»*, *«Отдыхают (<30%)»*.
   * Интерактивная шторка взаимодействия (Bottom Sheet):
     * Прямой переход в диалог в Telegram.
     * Быстрые контекстные пинги через бота (*«Зовет на кофе ☕️»*, *«Шлет лучи тепла 🫂»*).

3. **Комнаты и Тусовки (Группы):**
   * Круги общения (*«Лучшие друзья»*, *«Универ»*, *«Офис»*).
   * Расчет среднего уровня заряда всей компании.
   * Кнопка **«Собрать тусовку»** — автоматически пингует участников группы, у кого заряд выше 70%.

4. **Интеграция с ботом и виральность:**
   * Реферальные ссылки `t.me/bot?startapp=ref_ID` для взаимного добавления в друзья в 1 клик.
   * Быстрый утренний чек-ин в чате с ботом с инлайн-кнопками: `[🔋 100%] [⚡️ 70%] [🪫 30%] [🔌 0%]`.
   * **Smart Matching:** Если у двух близких друзей статус одновременно поднимается выше 80%, бот уведомляет обоих.
   * **Inline-режим (`@bot_name`):** Отправка динамической карточки своего статуса в любой групповой чат.

---

## 🚀 Быстрый старт

### 1. Фронтенд (React + Vite + Tailwind CSS)

```bash
cd frontend
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173) в браузере.  
При открытии вне Telegram автоматически включается **Dev Mode**, эмулирующий Telegram WebApp API (с возможностью тестировать вибрацию, пинги и смарт-матчинг прямо в браузере).

### 2. Бэкенд и Telegram-бот (FastAPI + aiogram 3.x)

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

Сервер запустится на [http://localhost:8000](http://localhost:8000).  
Документация Swagger API доступна по адресу: [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🤖 Подключение к реальному Telegram-боту

1. **Создайте бота в [@BotFather](https://t.me/BotFather):**
   * Отправьте `/newbot`, укажите имя и юзернейм (например, `social_battery_test_bot`).
   * Скопируйте полученный **HTTP API Token**.
   * Вставьте токен в `backend/.env`:
     ```env
     BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
     DEV_MODE=False
     ```

2. **Настройте Mini App в [@BotFather](https://t.me/BotFather):**
   * Отправьте `/newapp` $\to$ выберите вашего бота.
   * Укажите название и описание приложения.
   * В поле URL введите ваш публичный HTTPS адрес (через `ngrok` или хостинг, например: `https://your-app.ngrok-free.app`).
   * Включите инлайн-режим: `/setinline` $\to$ выберите бота $\to$ введите плейсхолдер `Поделиться своим зарядом`.

3. **Проброс локального фронтенда в интернет (для тестирования на телефоне):**
   ```bash
   ngrok http 5173
   ```
   Скопируйте полученный `https://...` адрес и укажите его в BotFather.

---

## 📂 Структура проекта

```text
social-battery-tma/
├── frontend/                     # React 18, Vite, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── components/           # BatteryWidget, BatterySlider, MoodTags, FriendsRadar, FriendSheet, RoomsTab
│   │   ├── services/             # telegram.ts (SDK & fallback), mockData.ts
│   │   ├── types/                # TypeScript интерфейсы
│   │   ├── utils/                # battery.ts (градиенты, цвета, логика)
│   │   ├── App.tsx               # Главный экран и навигация
│   │   └── main.tsx
│   └── package.json
│
├── backend/                      # Python FastAPI + aiogram 3
│   ├── bot/
│   │   ├── handlers.py           # /start, рефералы, инлайн чек-ины
│   │   ├── inline.py             # Инлайн-режим @bot_name
│   │   └── notifications.py      # Уведомления о пингах и Smart Match
│   ├── routes/
│   │   ├── battery.py            # /api/battery endpoints
│   │   ├── friends.py            # /api/friends endpoints
│   │   ├── pings.py              # /api/ping endpoints
│   │   └── rooms.py              # /api/rooms endpoints
│   ├── auth.py                   # HMAC-SHA256 криптографическая проверка initData
│   ├── database.py               # SQLAlchemy модели (User, Friendship, Room, Ping)
│   ├── config.py                 # Переменные окружения
│   └── main.py                   # Запуск FastAPI и бота
└── README.md
```
