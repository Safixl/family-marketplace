/**
 * Визуальная прогрессия достижений: чем выше уровень, тем «богаче» рамка,
 * градиент и бейдж. Уровень берётся из achievement.level (0 — одиночное).
 *
 * Тиры согласованы с ранговой системой прокачки: Бронза → Серебро → Золото →
 * Платина → Изумруд → Алмаз.
 */
export interface AchievementTier {
  name: string;
  emoji: string;
  /** Tailwind-классы рамки/фона карточки (светлая — для попапа) */
  card: string;
  /** Tailwind-классы цветной рамки на тёмной карточке */
  border: string;
  /** Классы бейджа уровня */
  badge: string;
  /** Классы иконки-контейнера */
  iconBox: string;
  /** Дополнительное свечение для топ-тиров */
  glow?: string;
}

export function tierForLevel(level: number): AchievementTier {
  // Одиночные достижения (level 0) — золотые
  if (level <= 0) {
    return {
      name: 'Золото',
      emoji: '🥇',
      card: 'border-yellow-500/60 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100',
      border: 'border-amber-400/70',
      badge: 'bg-amber-500 text-white',
      iconBox: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      glow: 'shadow-lg shadow-amber-500/20',
    };
  }
  if (level >= 9) {
    return {
      name: 'Алмаз',
      emoji: '👑',
      card: 'border-fuchsia-400/70 bg-gradient-to-br from-fuchsia-50 via-violet-50 to-indigo-100',
      border: 'border-fuchsia-400/70',
      badge: 'bg-fuchsia-600 text-white',
      iconBox: 'bg-gradient-to-br from-fuchsia-400 to-violet-500',
      glow: 'shadow-lg shadow-fuchsia-500/20',
    };
  }
  if (level >= 7) {
    return {
      name: 'Изумруд',
      emoji: '💚',
      card: 'border-emerald-400/70 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100',
      border: 'border-emerald-400/70',
      badge: 'bg-emerald-600 text-white',
      iconBox: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      glow: 'shadow-lg shadow-emerald-500/20',
    };
  }
  if (level >= 5) {
    return {
      name: 'Платина',
      emoji: '💎',
      card: 'border-cyan-400/60 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100',
      border: 'border-cyan-400/60',
      badge: 'bg-cyan-600 text-white',
      iconBox: 'bg-gradient-to-br from-cyan-400 to-sky-500',
      glow: 'shadow-lg shadow-cyan-500/20',
    };
  }
  if (level >= 3) {
    return {
      name: 'Золото',
      emoji: '🥇',
      card: 'border-yellow-500/60 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100',
      border: 'border-amber-400/70',
      badge: 'bg-amber-500 text-white',
      iconBox: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      glow: 'shadow-lg shadow-amber-500/20',
    };
  }
  if (level >= 2) {
    return {
      name: 'Серебро',
      emoji: '🥈',
      card: 'border-slate-400/50 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200',
      border: 'border-slate-400/60',
      badge: 'bg-slate-500 text-white',
      iconBox: 'bg-gradient-to-br from-slate-300 to-slate-400',
    };
  }
  return {
    name: 'Бронза',
    emoji: '🥉',
    card: 'border-amber-700/40 bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100',
    border: 'border-amber-700/60',
    badge: 'bg-amber-700 text-white',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600',
  };
}

/**
 * Стили для 11 рангов прокачки (витрина «Путь героя», бейджи уровня).
 * Ключ — минимальный уровень ранга (1, 6, 12, … 60), совпадает с rpg.ts RANKS.
 */
export interface RankTier {
  name: string;
  emoji: string;
  /** Бейдж текущего/достигнутого ранга */
  badge: string;
  /** Фон медали-иконки */
  medal: string;
  /** Цвет линии/шейпа прогресса */
  accent: string;
  /** Свечение для топ-рангов */
  glow?: string;
}

export const RANK_TIERS: Array<{ min: number; tier: RankTier }> = [
  { min: 1, tier: { name: 'Дерево', emoji: '🌳', badge: 'bg-lime-700 text-white', medal: 'bg-gradient-to-br from-lime-500 to-green-700', accent: '#65a30d' } },
  { min: 6, tier: { name: 'Железо', emoji: '⚙️', badge: 'bg-slate-600 text-white', medal: 'bg-gradient-to-br from-slate-400 to-slate-600', accent: '#64748b' } },
  { min: 12, tier: { name: 'Бронза', emoji: '🥉', badge: 'bg-amber-700 text-white', medal: 'bg-gradient-to-br from-amber-500 to-orange-700', accent: '#b45309' } },
  { min: 18, tier: { name: 'Серебро', emoji: '🥈', badge: 'bg-slate-400 text-slate-900', medal: 'bg-gradient-to-br from-slate-200 to-slate-400', accent: '#94a3b8' } },
  { min: 24, tier: { name: 'Золото', emoji: '🥇', badge: 'bg-amber-500 text-white', medal: 'bg-gradient-to-br from-yellow-300 to-amber-500', accent: '#f59e0b', glow: 'shadow-lg shadow-amber-400/50' } },
  { min: 30, tier: { name: 'Платина', emoji: '🛡️', badge: 'bg-cyan-600 text-white', medal: 'bg-gradient-to-br from-cyan-300 to-sky-500', accent: '#06b6d4', glow: 'shadow-lg shadow-cyan-300/50' } },
  { min: 36, tier: { name: 'Изумруд', emoji: '💚', badge: 'bg-emerald-600 text-white', medal: 'bg-gradient-to-br from-emerald-300 to-teal-600', accent: '#10b981', glow: 'shadow-lg shadow-emerald-300/50' } },
  { min: 42, tier: { name: 'Алмаз', emoji: '💎', badge: 'bg-fuchsia-600 text-white', medal: 'bg-gradient-to-br from-fuchsia-300 to-violet-600', accent: '#c026d3', glow: 'shadow-lg shadow-fuchsia-300/50' } },
  { min: 48, tier: { name: 'Мастер', emoji: '🎓', badge: 'bg-violet-600 text-white', medal: 'bg-gradient-to-br from-violet-300 to-purple-600', accent: '#7c3aed', glow: 'shadow-lg shadow-violet-300/50' } },
  { min: 52, tier: { name: 'Гранд-мастер', emoji: '👑', badge: 'bg-indigo-600 text-white', medal: 'bg-gradient-to-br from-indigo-300 to-indigo-600', accent: '#4f46e5', glow: 'shadow-lg shadow-indigo-300/50' } },
  { min: 60, tier: { name: 'Чемпион', emoji: '🏆', badge: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white', medal: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-rose-400', accent: '#f59e0b', glow: 'shadow-lg shadow-amber-300/60' } },
];

/** Стиль ранга по его минимальному уровню (1..60). */
export function rankTier(minLevel: number): RankTier {
  return RANK_TIERS.find((r) => r.min === minLevel)?.tier ?? RANK_TIERS[0].tier;
}
