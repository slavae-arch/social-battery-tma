import React from 'react';
import { DurationOption, PrivacyOption } from '../types';
import { telegram } from '../services/telegram';
import { Clock, Eye, Users, Star } from 'lucide-react';

interface DurationPickerProps {
  duration: DurationOption;
  onChangeDuration: (d: DurationOption) => void;
  privacy: PrivacyOption;
  onChangePrivacy: (p: PrivacyOption) => void;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  duration,
  onChangeDuration,
  privacy,
  onChangePrivacy,
}) => {
  const durations: { id: DurationOption; label: string }[] = [
    { id: '2h', label: '2ч' },
    { id: '4h', label: '4ч' },
    { id: 'morning', label: 'До утра' },
    { id: 'until_change', label: 'Пока сам не сменю' },
  ];

  return (
    <div className="w-full max-w-sm px-4 mt-4 flex flex-col gap-3">
      {/* Privacy Switcher */}
      <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">Видимость:</span>
        </div>
        <div className="flex bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              telegram.hapticImpact('light');
              onChangePrivacy('all');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              privacy === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Все друзья</span>
          </button>
          <button
            onClick={() => {
              telegram.hapticImpact('light');
              onChangePrivacy('close_friends');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              privacy === 'close_friends'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3 h-3 text-amber-200" />
            <span>Только близкие</span>
          </button>
        </div>
      </div>

      {/* Timer / Reset Duration */}
      <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">Сброс статуса:</span>
        </div>
        <div className="flex gap-1">
          {durations.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                telegram.hapticImpact('light');
                onChangeDuration(d.id);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                duration === d.id
                  ? 'bg-slate-700 text-white shadow-sm border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
