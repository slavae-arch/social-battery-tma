import { Friend, MoodTag, PingPreset, Room } from '../types';

export const MOOD_TAGS: MoodTag[] = [
  '🔋 В ресурсе',
  '☕️ Хочу кофе',
  '🎉 Готов к движу',
  '🍕 Погнали есть',
  '💻 В потоке',
  '🧠 Перегруз',
  '🪫 Не трогать',
  '😴 Сплю / Отдыхаю',
];

export const INITIAL_FRIENDS: Friend[] = [];

export const INITIAL_ROOMS: Room[] = [];

export const PING_PRESETS: PingPreset[] = [
  {
    id: 'coffee',
    icon: '☕️',
    label: 'Позвать на кофе',
    message: 'видит твой заряд и зовет на кофе ☕️',
    type: 'hangout',
  },
  {
    id: 'hangout',
    icon: '🎉',
    label: 'Погнали тусить',
    message: 'предлагает выбраться куда-нибудь прямо сейчас! 🚀',
    type: 'hangout',
  },
  {
    id: 'support',
    icon: '🫂',
    label: 'Шлю лучи тепла',
    message: 'шлет тебе лучи поддержки и обнимает! Держись 🫂',
    type: 'support',
  },
  {
    id: 'silence',
    icon: '🤫',
    label: 'Не буду отвлекать',
    message: 'заметил, что ты не в ресурсе, и желает хорошего отдыха 🤍',
    type: 'support',
  },
];
