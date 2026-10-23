export type MoodTag = 
  | '🔋 В ресурсе'
  | '☕️ Хочу кофе'
  | '🎉 Готов к движу'
  | '🍕 Погнали есть'
  | '💻 В потоке'
  | '🧠 Перегруз'
  | '🪫 Не трогать'
  | '😴 Сплю / Отдыхаю';

export type DurationOption = '2h' | '4h' | 'morning' | 'until_change';

export type PrivacyOption = 'all' | 'close_friends';

export interface UserProfile {
  id: number;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  battery_level: number;
  mood_tag: MoodTag;
  privacy: PrivacyOption;
  duration: DurationOption;
  updated_at: string;
}

export interface Friend {
  id: number;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  battery_level: number;
  mood_tag: MoodTag;
  is_close_friend: boolean;
  is_demo?: boolean;
  updated_at: string;
  updated_ago: string;
}

export interface RoomMember {
  id: number;
  first_name: string;
  username: string;
  photo_url?: string;
  battery_level: number;
  mood_tag: MoodTag;
  is_demo?: boolean;
}

export interface Room {
  id: string;
  title: string;
  icon: string;
  description: string;
  avg_battery: number;
  members_count: number;
  members: RoomMember[];
}

export interface PingPreset {
  id: string;
  icon: string;
  label: string;
  message: string;
  type: 'hangout' | 'support' | 'custom';
}
