import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'match';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce-short">
      <div
        onClick={onClose}
        className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md cursor-pointer transition-all ${
          type === 'match'
            ? 'bg-gradient-to-r from-amber-600/95 to-orange-600/95 border-amber-400/50 text-white'
            : type === 'info'
            ? 'bg-slate-900/95 border-blue-500/50 text-white'
            : 'bg-slate-900/95 border-emerald-500/50 text-white'
        }`}
      >
        {type === 'match' && <Sparkles className="w-5 h-5 text-amber-200 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />}
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {type === 'info' && <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />}

        <div className="flex-1 text-xs font-semibold leading-tight">{message}</div>
      </div>
    </div>
  );
};
