import React from 'react';
import { Smartphone, Flame, RefreshCw } from 'lucide-react';
import { telegram } from '../services/telegram';

interface DevBannerProps {
  onSimulateSmartMatch: () => void;
  onSimulateFriendUpdate: () => void;
}

export const DevBanner: React.FC<DevBannerProps> = ({
  onSimulateSmartMatch,
  onSimulateFriendUpdate,
}) => {
  const isRealTelegram = telegram.isAvailable();

  if (isRealTelegram) {
    return null;
  }

  return (
    <div className="w-full max-w-sm px-4 pt-2">
      <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-2.5 flex flex-col gap-2 shadow-sm text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>Browser Dev Mode (TMA Simulation)</span>
          </div>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
            Active
          </span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={onSimulateSmartMatch}
            className="flex-1 py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-all"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Тест Smart Match (&gt;80%)</span>
          </button>

          <button
            onClick={onSimulateFriendUpdate}
            className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-all"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Обновить друзей</span>
          </button>
        </div>
      </div>
    </div>
  );
};
