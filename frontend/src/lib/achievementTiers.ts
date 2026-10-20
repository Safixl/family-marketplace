/**
 * Визуальная прогрессия достижений: чем выше уровень, тем «богаче» рамка,
 * градиент и бейдж. Уровень берётся из achievement.level.
 *
 * Уровень 0 — одиночное достижение (Золото, без шкалы).
 * Уровни 1..11 — 11 рангов, совпадающих с ранговой системой прокачки
 * персонажа: Дерево → Железо → Бронза → Серебро → Золото → Платина →
 * Изумруд → Алмаз → Мастер → Гранд-мастер → Чемпион.
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
  // Одиночные достижения (level 0) — золотые, без ранговой шкалы
  if (level <= 0) {
    return {
      name: 'Одиночное',
      emoji: '🥇',
      card: 'border-yellow-500/60 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100',
      border: 'border-amber-400/70',
      badge: 'bg-amber-500 text-white',
      iconBox: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      glow: 'shadow-lg shadow-amber-500/20',
    };
  }

  switch (level) {
    case 1: // Дерево
      return {
        name: 'Дерево',
        emoji: '🌳',
        card: 'border-lime-600/40 bg-gradient-to-br from-lime-50 via-green-50 to-emerald-100',
        border: 'border-lime-600/60',
        badge: 'bg-lime-700 text-white',
        iconBox: 'bg-gradient-to-br from-lime-500 to-green-700',
      };
    case 2: // Железо
      return {
        name: 'Железо',
        emoji: '⚙️',
        card: 'border-slate-500/40 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200',
        border: 'border-slate-500/60',
        badge: 'bg-slate-600 text-white',
        iconBox: 'bg-gradient-to-br from-slate-400 to-slate-600',
      };
    case 3: // Бронза
      return {
        name: 'Бронза',
        emoji: '🥉',
        card: 'border-amber-700/40 bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100',
        border: 'border-amber-700/60',
        badge: 'bg-amber-700 text-white',
        iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600',
      };
    case 4: // Серебро
      return {
        name: 'Серебро',
        emoji: '🥈',
        card: 'border-slate-400/50 bg-gradient-to-br from-slate-50 via-gray-100 to-gray-200',
        border: 'border-slate-400/60',
        badge: 'bg-slate-500 text-white',
        iconBox: 'bg-gradient-to-br from-slate-300 to-slate-500',
      };
    case 5: // Золото
      return {
        name: 'Золото',
        emoji: '🥇',
        card: 'border-yellow-500/60 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100',
        border: 'border-amber-400/70',
        badge: 'bg-amber-500 text-white',
        iconBox: 'bg-gradient-to-br from-yellow-400 to-amber-500',
        glow: 'shadow-lg shadow-amber-500/20',
      };
    case 6: // Платина
      return {
        name: 'Платина',
        emoji: '💎',
        card: 'border-cyan-400/60 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100',
        border: 'border-cyan-400/60',
        badge: 'bg-cyan-600 text-white',
        iconBox: 'bg-gradient-to-br from-cyan-400 to-sky-500',
        glow: 'shadow-lg shadow-cyan-500/20',
      };
    case 7: // Изумруд
      return {
        name: 'Изумруд',
        emoji: '💚',
        card: 'border-emerald-400/70 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100',
        border: 'border-emerald-400/70',
        badge: 'bg-emerald-600 text-white',
        iconBox: 'bg-gradient-to-br from-emerald-400 to-teal-500',
        glow: 'shadow-lg shadow-emerald-500/20',
      };
    case 8: // Алмаз
      return {
        name: 'Алмаз',
        emoji: '🔷',
        card: 'border-fuchsia-400/70 bg-gradient-to-br from-fuchsia-50 via-violet-50 to-indigo-100',
        border: 'border-fuchsia-400/70',
        badge: 'bg-fuchsia-600 text-white',
        iconBox: 'bg-gradient-to-br from-fuchsia-400 to-violet-500',
        glow: 'shadow-lg shadow-fuchsia-500/20',
      };
    case 9: // Мастер
      return {
        name: 'Мастер',
        emoji: '🎓',
        card: 'border-purple-500/60 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
        border: 'border-purple-500/70',
        badge: 'bg-purple-600 text-white',
        iconBox: 'bg-gradient-to-br from-purple-500 to-violet-600',
        glow: 'shadow-lg shadow-purple-500/30',
      };
    case 10: // Гранд-мастер
      return {
        name: 'Гранд-мастер',
        emoji: '👑',
        card: 'border-indigo-500/60 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100',
        border: 'border-indigo-500/70',
        badge: 'bg-indigo-600 text-white',
        iconBox: 'bg-gradient-to-br from-indigo-500 to-blue-600',
        glow: 'shadow-lg shadow-indigo-500/30',
      };
    default: // Чемпион (level >= 11)
      return {
        name: 'Чемпион',
        emoji: '🏆',
        card: 'border-amber-400/80 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100',
        border: 'border-amber-400/80',
        badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        iconBox: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500',
        glow: 'shadow-lg shadow-amber-400/40',
      };
  }
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
  { min: 18, tier: { name: 'Серебро', emoji: '🥈', badge: 'bg-slate-500 text-white', medal: 'bg-gradient-to-br from-slate-300 to-slate-500', accent: '#94a3b8' } },
  { min: 24, tier: { name: 'Золото', emoji: '🥇', badge: 'bg-amber-500 text-white', medal: 'bg-gradient-to-br from-yellow-400 to-amber-600', accent: '#f59e0b' } },
  { min: 30, tier: { name: 'Платина', emoji: '💎', badge: 'bg-cyan-600 text-white', medal: 'bg-gradient-to-br from-cyan-400 to-sky-600', accent: '#06b6d4' } },
  { min: 36, tier: { name: 'Изумруд', emoji: '💚', badge: 'bg-emerald-600 text-white', medal: 'bg-gradient-to-br from-emerald-400 to-teal-600', accent: '#10b981' } },
  { min: 42, tier: { name: 'Алмаз', emoji: '🔷', badge: 'bg-fuchsia-600 text-white', medal: 'bg-gradient-to-br from-fuchsia-400 to-violet-600', accent: '#d946ef' } },
  { min: 48, tier: { name: 'Мастер', emoji: '🎓', badge: 'bg-purple-600 text-white', medal: 'bg-gradient-to-br from-purple-500 to-violet-700', accent: '#a855f7', glow: 'shadow-md shadow-purple-500/40' } },
  { min: 52, tier: { name: 'Гранд-мастер', emoji: '👑', badge: 'bg-indigo-600 text-white', medal: 'bg-gradient-to-br from-indigo-500 to-blue-700', accent: '#6366f1', glow: 'shadow-md shadow-indigo-500/40' } },
  { min: 60, tier: { name: 'Чемпион', emoji: '🏆', badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white', medal: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-600', accent: '#fbbf24', glow: 'shadow-lg shadow-amber-500/40' } },
];

/** Тир ранга по минимальному уровню (совпадает с rpg.ts RANKS). */
export function rankTier(min: number): RankTier {
  const entry = RANK_TIERS.filter((r) => r.min <= min).pop() ?? RANK_TIERS[0];
  return entry.tier;
}
