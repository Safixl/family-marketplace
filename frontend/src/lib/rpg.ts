/**
 * RPG-хелперы: уровни, опыт, ранги (в стиле WoW).
 */

export interface RpgLevel {
  level: number;
  /** Опыт внутри текущего уровня */
  xpInLevel: number;
  /** Опыт, нужный для перехода на следующий уровень */
  xpToNext: number;
  /** Прогресс внутри уровня 0..1 */
  ratio: number;
  rank: string;
  rankEmoji: string;
}

const RANKS: Array<{ min: number; name: string; emoji: string }> = [
  { min: 0, name: 'Новичок', emoji: '🌱' },
  { min: 3, name: 'Ученик', emoji: '📖' },
  { min: 6, name: 'Подмастерье', emoji: '🛠️' },
  { min: 10, name: 'Ремесленник', emoji: '⚒️' },
  { min: 15, name: 'Эксперт', emoji: '🎓' },
  { min: 21, name: 'Мастер', emoji: '🏅' },
  { min: 28, name: 'Гроссмейстер', emoji: '👑' },
  { min: 36, name: 'Легенда', emoji: '🌟' },
];

/** Опыт, необходимый для перехода с уровня level на level+1 (растущая кривая) */
export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

/** Суммарный опыт, нужный для достижения уровня level (с 1) */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/** Уровень по суммарному опыту */
export function levelFromXp(xp: number): RpgLevel {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const xpToNext = xpForLevel(level);
  const rank = RANKS.filter((r) => r.min <= level).pop() ?? RANKS[0];
  return {
    level,
    xpInLevel: remaining,
    xpToNext,
    ratio: xpToNext > 0 ? Math.min(1, remaining / xpToNext) : 1,
    rank: rank.name,
    rankEmoji: rank.emoji,
  };
}

/** Уровень навыка по прогрессу 0..100 (1..10) */
export function skillLevelFromProgress(progress: number): number {
  return Math.max(1, Math.min(10, Math.floor(progress / 10) + 1));
}

/** Ранг навыка по прогрессу 0..100 */
export function skillRank(progress: number): { name: string; emoji: string } {
  if (progress >= 90) return { name: 'Легенда', emoji: '🌟' };
  if (progress >= 70) return { name: 'Мастер', emoji: '🏅' };
  if (progress >= 50) return { name: 'Эксперт', emoji: '🎓' };
  if (progress >= 30) return { name: 'Ученик', emoji: '📖' };
  if (progress >= 10) return { name: 'Новичок', emoji: '🌱' };
  return { name: 'Начинающий', emoji: '🌱' };
}
