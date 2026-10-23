import React, { useState } from 'react';
import { Friend } from '../types';
import { FriendCard } from './FriendCard';
import { UserPlus, Sparkles, Flame, BatteryLow, Star } from 'lucide-react';
import { telegram } from '../services/telegram';

interface FriendsRadarProps {
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
  onInviteFriend: () => void;
}

type FilterType = 'all' | 'ready' | 'low' | 'close';

export const FriendsRadar: React.FC<FriendsRadarProps> = ({
  friends,
  onSelectFriend,
  onInviteFriend,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredFriends = friends.filter((f) => {
    if (activeFilter === 'ready') return f.battery_level >= 70;
    if (activeFilter === 'low') return f.battery_level <= 30;
    if (activeFilter === 'close') return f.is_close_friend;
    return true;
  });

  return (
    <div className="w-full max-w-sm px-4 flex flex-col gap-3">
      {/* Invite Friends Banner */}
      <div className="p-3.5 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-blue-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Радар друзей
          </span>
          <span className="text-[11px] text-slate-300 mt-0.5">
            Следи за настроением и уровнем энергии
          </span>
        </div>
        <button
          onClick={() => {
            telegram.hapticNotification('success');
            onInviteFriend();
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Позвать</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all' as FilterType, label: 'Все', count: friends.length },
          {
            id: 'ready' as FilterType,
            label: 'К движу (>70%)',
            icon: Flame,
            count: friends.filter((f) => f.battery_level >= 70).length,
          },
          {
            id: 'close' as FilterType,
            label: 'Близкие',
            icon: Star,
            count: friends.filter((f) => f.is_close_friend).length,
          },
          {
            id: 'low' as FilterType,
            label: 'Отдыхают',
            icon: BatteryLow,
            count: friends.filter((f) => f.battery_level <= 30).length,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                telegram.hapticImpact('light');
                setActiveFilter(tab.id);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-slate-200 text-slate-900 border-white shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-400/40 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Friends Cards List */}
      <div className="flex flex-col gap-2 mt-1">
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onClick={() => onSelectFriend(friend)}
            />
          ))
        ) : (
          <div className="text-center py-10 px-4 bg-slate-900/60 rounded-3xl border border-slate-800/80 flex flex-col items-center gap-3 shadow-inner">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl">
              🔋
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">
                {friends.length === 0
                  ? 'У вас пока нет друзей в Батарейке'
                  : 'В этой категории никого нет'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                {friends.length === 0
                  ? 'Отправьте инвайт-ссылку друзьям, чтобы видеть их заряд и настроение!'
                  : 'Попробуйте переключить фильтр выше'}
              </p>
            </div>
            {friends.length === 0 && (
              <button
                onClick={() => {
                  telegram.hapticNotification('success');
                  onInviteFriend();
                }}
                className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Пригласить друга</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
