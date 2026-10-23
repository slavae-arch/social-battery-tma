import React from 'react';
import { MoodTag } from '../types';
import { MOOD_TAGS } from '../services/mockData';
import { telegram } from '../services/telegram';

interface MoodTagsProps {
  selectedTag: MoodTag;
  onSelectTag: (tag: MoodTag) => void;
}

export const MoodTags: React.FC<MoodTagsProps> = ({ selectedTag, onSelectTag }) => {
  const handleTagClick = (tag: MoodTag) => {
    telegram.hapticImpact('light');
    onSelectTag(tag);
  };

  return (
    <div className="w-full max-w-sm px-4 mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Текущее состояние:
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {MOOD_TAGS.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-blue-600/30 text-blue-200 border-blue-400/80 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
