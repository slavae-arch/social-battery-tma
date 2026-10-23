import React from 'react';
import { getBatteryColor, getBatteryLabel, getBatteryTailwindClass } from '../utils/battery';
import { Zap, Sparkles } from 'lucide-react';

interface BatteryWidgetProps {
  level: number;
  moodTag: string;
}

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({ level, moodTag }) => {
  const color = getBatteryColor(level);
  const tailwind = getBatteryTailwindClass(level);
  const label = getBatteryLabel(level);

  return (
    <div className="relative flex flex-col items-center justify-center my-4 transition-all duration-300">
      {/* Background radial glow */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: color }}
      />

      {/* Battery Container */}
      <div className="relative flex flex-col items-center">
        {/* Terminal / Battery Cap */}
        <div
          className="w-16 h-3 rounded-t-md transition-colors duration-300 opacity-90 shadow-sm"
          style={{ backgroundColor: color }}
        />

        {/* Battery Main Body */}
        <div
          className="relative w-44 h-64 rounded-3xl p-2.5 bg-slate-900/90 border-2 transition-all duration-300 shadow-2xl backdrop-blur-md flex flex-col justify-end overflow-hidden"
          style={{ borderColor: `${color}60` }}
        >
          {/* Subtle grid lines inside battery for tech feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_24%,rgba(255,255,255,0.03)_25%)] bg-[size:100%_25%] pointer-events-none" />

          {/* Liquid Charge Fill Level */}
          <div
            className="w-full rounded-2xl transition-all duration-500 ease-out relative overflow-hidden flex flex-col justify-start"
            style={{
              height: `${Math.max(level, 6)}%`,
              backgroundColor: color,
              boxShadow: `0 0 25px ${color}80, inset 0 0 15px rgba(255,255,255,0.4)`,
            }}
          >
            {/* Liquid Surface Wave Effect */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 blur-[1px] animate-pulse" />

            {/* Rising Bubbles / Energy Sparkles */}
            {level >= 50 && (
              <div className="absolute inset-0 flex justify-around opacity-30 pointer-events-none">
                <span className="animate-bounce delay-100 text-xs">⚡️</span>
                <span className="animate-bounce delay-300 text-xs">✨</span>
              </div>
            )}
          </div>

          {/* Central Overlay Information */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex items-center gap-1 drop-shadow-lg">
              {level >= 80 && <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />}
              {level > 0 && level < 80 && <Zap className="w-5 h-5 text-white/90" />}
              <span className="text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {level}%
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-200/90 px-2 py-0.5 mt-1 rounded-full bg-slate-950/60 backdrop-blur-sm border border-white/10">
              {moodTag}
            </span>
          </div>
        </div>
      </div>

      {/* Mood status description caption */}
      <div className="mt-3 text-center">
        <p className={`text-sm font-semibold tracking-wide transition-colors ${tailwind.text}`}>
          {label}
        </p>
      </div>
    </div>
  );
};
