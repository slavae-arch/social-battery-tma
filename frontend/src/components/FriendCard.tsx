import React from 'react';
import { Friend } from '../types';
import { getBatteryColor, getBatteryTailwindClass } from '../utils/battery';
import { Star, Clock } from 'lucide-react';
import { telegram } from '../services/telegram';

interface FriendCardProps {
  friend: Friend;
  onClick: () => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onClick }) => {
  const color = getBatteryColor(friend.battery_level);
  const tailwind = getBatteryTailwindClass(friend.battery_level);

  const handleClick = () => {
    telegram.hapticImpact('light');
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className="p-3.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 rounded-2xl flex items-center justify-between transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm group"
    >
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3">
        {/* Avatar with Battery Ring */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full p-0.5 transition-colors"
            style={{ backgroundColor: color }}
          >
            {friend.photo_url ? (
              <img
                src={friend.photo_url}
                alt={friend.first_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-white">
                {friend.first_name[0]}
              </div>
            )}
          </div>
          {friend.is_close_friend && (
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-slate-900 shadow">
              <Star className="w-2.5 h-2.5 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Name & Tag */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">
              {friend.first_name} {friend.last_name || ''}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-300 font-medium bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700/50">
              {friend.mood_tag}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
            <Clock className="w-2.5 h-2.5" />
            <span>{friend.updated_ago}</span>
          </div>
        </div>
      </div>

      {/* Right: Battery Gauge & Percentage */}
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-baseline gap-1">
          <span className={`text-base font-extrabold ${tailwind.text}`}>
            {friend.battery_level}%
          </span>
        </div>

        {/* Mini Battery Bar */}
        <div className="w-12 h-2.5 bg-slate-950 rounded-full border border-slate-700/60 p-0.5 overflow-hidden flex items-center">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(friend.battery_level, 8)}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );
};
