/**
 * Визуальная прогрессия достижений: чем выше уровень, тем «богаче» рамка,
 * градиент и бейдж. Уровень берётся из achievement.level (0 — одиночное).
 */
export interface AchievementTier {
  name: string;
  emoji: string;
  /** Tailwind-классы рамки/фона карточки */
  card: string;
  /** Классы бейджа уровня */
  badge: string;
  /** Классы иконки-контейнера */
  iconBox: string;
  /** Дополнительное свечение для топ-тиров */
  glow?: string;
}

export function tierForLevel(level: number): AchievementTier {
  if (level >= 8) {
    return {
      name: 'Алмаз',
      emoji: '👑',
      card: 'border-fuchsia-400/70 bg-gradient-to-br from-fuchsia-50 via-violet-50 to-indigo-100',
      badge: 'bg-fuchsia-600 text-white',
      iconBox: 'bg-gradient-to-br from-fuchsia-400 to-violet-500',
      glow: 'shadow-lg shadow-fuchsia-300/60',
    };
  }
  if (level >= 6) {
    return {
      name: 'Платина',
      emoji: '💎',
      card: 'border-cyan-400/60 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100',
      badge: 'bg-cyan-600 text-white',
      iconBox: 'bg-gradient-to-br from-cyan-400 to-sky-500',
      glow: 'shadow-lg shadow-cyan-200/60',
    };
  }
  if (level >= 4) {
    return {
      name: 'Золото',
      emoji: '🥇',
      card: 'border-yellow-500/60 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100',
      badge: 'bg-amber-500 text-white',
      iconBox: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      glow: 'shadow-lg shadow-amber-200/60',
    };
  }
  if (level >= 2) {
    return {
      name: 'Серебро',
      emoji: '🥈',
      card: 'border-slate-400/50 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200',
      badge: 'bg-slate-500 text-white',
      iconBox: 'bg-gradient-to-br from-slate-300 to-slate-400',
    };
  }
  return {
    name: 'Бронза',
    emoji: '🥉',
    card: 'border-amber-700/40 bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100',
    badge: 'bg-amber-700 text-white',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600',
  };
}
