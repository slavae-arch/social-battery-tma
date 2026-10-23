export function getBatteryColor(level: number): string {
  if (level >= 80) return '#10b981'; // Emerald 500
  if (level >= 60) return '#84cc16'; // Lime 500
  if (level >= 40) return '#eab308'; // Yellow 500
  if (level >= 20) return '#f97316'; // Orange 500
  return '#ef4444'; // Red 500
}

export function getBatteryTailwindClass(level: number): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  if (level >= 80) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    };
  }
  if (level >= 60) {
    return {
      text: 'text-lime-400',
      bg: 'bg-lime-500',
      border: 'border-lime-500/30',
      glow: 'shadow-[0_0_20px_rgba(132,204,22,0.35)]',
    };
  }
  if (level >= 40) {
    return {
      text: 'text-yellow-400',
      bg: 'bg-yellow-500',
      border: 'border-yellow-500/30',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.35)]',
    };
  }
  if (level >= 20) {
    return {
      text: 'text-orange-400',
      bg: 'bg-orange-500',
      border: 'border-orange-500/30',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.35)]',
    };
  }
  return {
    text: 'text-red-400',
    bg: 'bg-red-500',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
  };
}

export function getBatteryLabel(level: number): string {
  if (level >= 90) return 'Максимальный заряд! 🚀';
  if (level >= 75) return 'Отличный настрой ⚡️';
  if (level >= 50) return 'В спокойном ритме ✨';
  if (level >= 25) return 'Мало энергии 🪫';
  return 'Нужна подзарядка 🔌';
}

export function getBatteryEmoji(level: number): string {
  if (level >= 80) return '🔋';
  if (level >= 50) return '⚡️';
  if (level >= 20) return '🪫';
  return '🔌';
}
