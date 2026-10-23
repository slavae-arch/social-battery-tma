import React, { useRef } from 'react';
import { telegram } from '../services/telegram';
import { getBatteryColor } from '../utils/battery';

interface BatterySliderProps {
  level: number;
  onChange: (newLevel: number) => void;
}

export const BatterySlider: React.FC<BatterySliderProps> = ({ level, onChange }) => {
  const lastHapticLevel = useRef<number>(level);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    // Vibrate haptic every 5%
    if (Math.abs(val - lastHapticLevel.current) >= 5) {
      telegram.hapticImpact('light');
      lastHapticLevel.current = val;
    }
    onChange(val);
  };

  const setPreset = (targetLevel: number) => {
    telegram.hapticImpact('medium');
    onChange(targetLevel);
  };

  const currentColor = getBatteryColor(level);

  return (
    <div className="w-full max-w-sm px-4 flex flex-col items-center gap-3">
      {/* Slider Track Container */}
      <div className="w-full relative flex items-center">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={level}
          onChange={handleSliderChange}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none transition-all"
          style={{
            background: `linear-gradient(to right, ${currentColor} 0%, ${currentColor} ${level}%, #1e293b ${level}%, #1e293b 100%)`,
          }}
        />
      </div>

      {/* Preset Quick Buttons */}
      <div className="grid grid-cols-4 gap-2 w-full mt-1">
        {[
          { label: '0%', icon: '🔌', value: 0 },
          { label: '30%', icon: '🪫', value: 30 },
          { label: '70%', icon: '⚡️', value: 70 },
          { label: '100%', icon: '🔋', value: 100 },
        ].map((preset) => {
          const isActive = Math.abs(level - preset.value) < 10;
          return (
            <button
              key={preset.value}
              onClick={() => setPreset(preset.value)}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 border transition-all active:scale-95 ${
                isActive
                  ? 'bg-slate-800/90 border-slate-600 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-sm">{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
