import React, { useState } from 'react';
import { Friend, PingPreset } from '../types';
import { getBatteryColor, getBatteryLabel, getBatteryTailwindClass } from '../utils/battery';
import { PING_PRESETS } from '../services/mockData';
import { telegram } from '../services/telegram';
import { X, Send, MessageCircle, Star, Sparkles } from 'lucide-react';

interface FriendSheetProps {
  friend: Friend | null;
  onClose: () => void;
  onSendPing: (friend: Friend, message: string) => void;
  onToggleCloseFriend: (friendId: number) => void;
}

export const FriendSheet: React.FC<FriendSheetProps> = ({
  friend,
  onClose,
  onSendPing,
  onToggleCloseFriend,
}) => {
  const [customPing, setCustomPing] = useState('');
  if (!friend) return null;

  const color = getBatteryColor(friend.battery_level);
  const tailwind = getBatteryTailwindClass(friend.battery_level);
  const label = getBatteryLabel(friend.battery_level);

  // Recommended ping actions based on friend's battery
  const relevantPresets: PingPreset[] = friend.battery_level >= 50
    ? PING_PRESETS.filter((p) => p.type === 'hangout')
    : PING_PRESETS.filter((p) => p.type === 'support');

  const handlePresetClick = (preset: PingPreset) => {
    telegram.hapticNotification('success');
    onSendPing(friend, preset.message);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPing.trim()) return;
    telegram.hapticNotification('success');
    onSendPing(friend, customPing.trim());
    setCustomPing('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content Container */}
      <div className="relative w-full max-w-md bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-1" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Friend Header */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full p-1 transition-all"
            style={{ backgroundColor: color }}
          >
            {friend.photo_url ? (
              <img
                src={friend.photo_url}
                alt={friend.first_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-xl text-white">
                {friend.first_name[0]}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white">
                {friend.first_name} {friend.last_name || ''}
              </h3>
              {friend.is_demo && (
                <span className="text-[10px] font-semibold text-amber-300/90 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                  тест
                </span>
              )}
              <button
                onClick={() => {
                  telegram.hapticImpact('light');
                  onToggleCloseFriend(friend.id);
                }}
                className={`p-1 rounded-full border transition-all ${
                  friend.is_close_friend
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
                title="Близкий друг"
              >
                <Star className={`w-4 h-4 ${friend.is_close_friend ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
            {friend.username && (
              <span className="text-xs text-slate-400 font-mono">@{friend.username}</span>
            )}
            <span className="text-[11px] text-slate-500 mt-0.5">Обновлено {friend.updated_ago}</span>
          </div>
        </div>

        {/* Battery Banner */}
        <div
          className="p-4 rounded-2xl border flex items-center justify-between"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}40`,
          }}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${tailwind.text}`}>
                {friend.battery_level}%
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 text-white border border-white/10">
                {friend.mood_tag}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{label}</p>
          </div>

          {/* Graphical battery icon */}
          <div className="w-12 h-6 rounded-md border-2 border-white/40 p-0.5 flex items-center">
            <div
              className="h-full rounded-sm transition-all"
              style={{
                width: `${friend.battery_level}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>

        {/* Primary Action: Direct Message in Telegram */}
        <button
          onClick={() => {
            telegram.hapticImpact('medium');
            telegram.openTelegramChat(friend.username, friend.telegram_id);
          }}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Написать в Telegram</span>
        </button>

        {/* Contextual Bot Pings */}
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Быстрый пинг через бота:
          </span>

          <div className="grid grid-cols-2 gap-2">
            {relevantPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-left flex flex-col gap-1 transition-all active:scale-95 group"
              >
                <span className="text-lg">{preset.icon}</span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Ping Input */}
          <form onSubmit={handleCustomSend} className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Свой быстрый пинг..."
              value={customPing}
              onChange={(e) => setCustomPing(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!customPing.trim()}
              className="p-2.5 rounded-xl bg-slate-800 text-blue-400 hover:text-white hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-slate-800 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
