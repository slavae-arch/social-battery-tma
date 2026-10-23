import React from 'react';
import { UserProfile } from '../types';
import { getBatteryColor, getBatteryLabel } from '../utils/battery';
import { telegram } from '../services/telegram';
import { X, Share2, Sparkles, Copy, Check } from 'lucide-react';

interface StoriesShareModalProps {
  user: UserProfile;
  onClose: () => void;
  onCopied: () => void;
}

export const StoriesShareModal: React.FC<StoriesShareModalProps> = ({
  user,
  onClose,
  onCopied,
}) => {
  const [copied, setCopied] = React.useState(false);
  const color = getBatteryColor(user.battery_level);
  const label = getBatteryLabel(user.battery_level);

  const handleShare = () => {
    telegram.hapticNotification('success');
    // Call Telegram WebApp shareToStory
    const shared = telegram.shareToStory(
      user.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      `Моя социальная батарейка сейчас на ${user.battery_level}%! ${user.mood_tag}`
    );
    if (!shared) {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    telegram.hapticNotification('success');
    const link = `https://t.me/my_social_battery_bot?start=friend_${user.telegram_id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    onCopied();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xs bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Поделиться в Stories
        </span>

        {/* Stories Card Preview (9:16 aspect miniature) */}
        <div
          className="w-full aspect-[9/14] rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden border-2 shadow-2xl"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${color}35 0%, #090d16 85%)`,
            borderColor: `${color}60`,
          }}
        >
          {/* Header */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Социальная батарейка
            </span>
            <span className="text-xs font-bold text-slate-200 mt-1">
              @{user.username || user.first_name}
            </span>
          </div>

          {/* Huge Battery Indicator */}
          <div className="flex flex-col items-center my-auto">
            <div
              className="text-6xl font-black tracking-tight"
              style={{
                color: color,
                textShadow: `0 0 30px ${color}80`,
              }}
            >
              {user.battery_level}%
            </div>
            <span className="text-xs font-bold text-white px-3 py-1 rounded-full bg-slate-950/80 border border-white/20 mt-2 shadow-lg">
              {user.mood_tag}
            </span>
            <span className="text-[11px] text-slate-300 font-medium mt-1.5">{label}</span>
          </div>

          {/* Footer widget sticker prompt */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-white">Узнай заряд друзей ⚡️</span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex flex-col w-full gap-2">
          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Опубликовать в Stories</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Ссылка скопирована!' : 'Скопировать инвайт-ссылку'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
