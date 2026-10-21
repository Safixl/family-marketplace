/**
 * RPG-хелперы: уровни, опыт, ранги.
 *
 * Единая XP-кривая для 60 уровней. Применяется и к каждому навыку, и к общему
 * уровню персонажа:
 *   - уровень 1  — 60 (потолок: 60 = Чемпион, финальная точка ~5 лет игры);
 *   - таблица «уровень → опыт до следующего» задаётся массивом XP_CURVE;
 *   - суммарный опыт всего пути — MAX_TOTAL_XP (109 560 XP).
 */

export interface RpgLevel {
  level: number;
  /** Опыт внутри текущего уровня */
  xpInLevel: number;
  /** Опыт, нужный для перехода на следующий уровень (0 на потолке) */
  xpToNext: number;
  /** Прогресс внутри уровня 0..1 */
  ratio: number;
  rank: string;
  rankEmoji: string;
}

/** Максимальный уровень (потолок прогрессии). */
export const MAX_LEVEL = 60;

/**
 * Опыт, необходимый для перехода с уровня N на N+1 (индекс N-1).
 * Значения из дизайн-таблицы: от 42 XP на 1→2 до 5186 XP на 59→60.
 * Итого путь 1→60 = 109 560 XP ≈ 5 лет игры (~60 XP/день).
 */
export const XP_CURVE: number[] = [
  42, 48, 58, 71, 87,
  107, 130, 155, 184, 216,
  251, 289, 330, 374, 421,
  471, 523, 579, 637, 698,
  762, 829, 899, 971, 1046,
  1124, 1204, 1288, 1374, 1462,
  1554, 1648, 1745, 1844, 1947,
  2051, 2159, 2269, 2382, 2497,
  2615, 2736, 2859, 2985, 3113,
  3245, 3378, 3514, 3653, 3795,
  3939, 4085, 4234, 4386, 4540,
  4697, 4856, 5018, 5186,
];

/** Суммарный опыт, необходимый для достижения уровня 60 (весь путь). */
export const MAX_TOTAL_XP: number = XP_CURVE.reduce((sum, x) => sum + x, 0);

/**
 * Кривая опыта навыков (дизайн): 1–10 ур. по 500 XP, 11–30 по 1000,
 * 31–50 по 1500, 51–60 по 2500. Итого 80 000 XP на 60 уровней.
 */
export const SKILL_XP_CURVE: number[] = [
  500, 500, 500, 500, 500, 500, 500, 500, 500, 500,
  1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
  1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
  1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500,
  1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500,
  2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500,
];

/** Суммарный опыт навыка на весь путь 1→60 (80 000 XP). */
export const SKILL_TOTAL_XP: number = SKILL_XP_CURVE.reduce((sum, x) => sum + x, 0);

/** Ранги персонажа/навыка: имя и уровень, с которого ранг действует. */
export const RANKS: Array<{ min: number; name: string; emoji: string }> = [
  { min: 1, name: 'Дерево', emoji: '🌳' },
  { min: 6, name: 'Железо', emoji: '⚙️' },
  { min: 12, name: 'Бронза', emoji: '🥉' },
  { min: 18, name: 'Серебро', emoji: '🥈' },
  { min: 24, name: 'Золото', emoji: '🥇' },
  { min: 30, name: 'Платина', emoji: '🛡️' },
  { min: 36, name: 'Изумруд', emoji: '💚' },
  { min: 42, name: 'Алмаз', emoji: '💎' },
  { min: 48, name: 'Мастер', emoji: '🎓' },
  { min: 52, name: 'Гранд-мастер', emoji: '👑' },
  { min: 60, name: 'Чемпион', emoji: '🏆' },
];

/** Опыт, необходимый для перехода с уровня level на level+1 (0 на потолке). */
export function xpForLevel(level: number): number {
  if (level < 1) return XP_CURVE[0];
  if (level >= MAX_LEVEL) return 0;
  return XP_CURVE[level - 1] ?? 0;
}

/** Суммарный опыт, нужный для достижения уровня level (начиная с 1). */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < Math.min(level, MAX_LEVEL); i++) {
    total += xpForLevel(i);
  }
  return total;
}

/** Ранг по уровню персонажа/навыка. */
export function rankForLevel(level: number): { name: string; emoji: string } {
  const rank = RANKS.filter((r) => r.min <= level).pop() ?? RANKS[0];
  return { name: rank.name, emoji: rank.emoji };
}

/** Уровень навыка по накопленному опыту (кривая 500/1000/1500/2500). */
export function skillLevelFromXp(xp: number): RpgLevel {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (level < MAX_LEVEL && remaining >= SKILL_XP_CURVE[level - 1]) {
    remaining -= SKILL_XP_CURVE[level - 1];
    level++;
  }
  const capped = level >= MAX_LEVEL;
  const xpToNext = capped ? 0 : SKILL_XP_CURVE[level - 1];
  const rank = rankForLevel(level);
  return {
    level,
    xpInLevel: capped ? 0 : remaining,
    xpToNext,
    ratio: capped || xpToNext <= 0 ? 1 : Math.min(1, remaining / xpToNext),
    rank: rank.name,
    rankEmoji: rank.emoji,
  };
}

/** Уровень по суммарному опыту (общий уровень или уровень навыка). */
export function levelFromXp(xp: number): RpgLevel {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (level < MAX_LEVEL && remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const capped = level >= MAX_LEVEL;
  const xpToNext = capped ? 0 : xpForLevel(level);
  const rank = rankForLevel(level);
  return {
    level,
    xpInLevel: capped ? 0 : remaining,
    xpToNext,
    ratio: capped || xpToNext <= 0 ? 1 : Math.min(1, remaining / xpToNext),
    rank: rank.name,
    rankEmoji: rank.emoji,
  };
}

/**
 * Уровень навыка по прогрессу 0..100.
 * Прогресс навыка интерпретируется как процент пути от 1-го до 60-го уровня:
 * 100% прогресса = уровень 60 навыка (Чемпион в этом направлении).
 */
export function skillLevelFromProgress(progress: number): number {
  const p = Math.max(0, Math.min(100, progress));
  return skillLevelFromXp((p / 100) * SKILL_TOTAL_XP).level;
}

/** Ранг навыка по прогрессу 0..100 (по той же таблице рангов, что и общий уровень). */
export function skillRank(progress: number): { name: string; emoji: string } {
  const p = Math.max(0, Math.min(100, progress));
  return rankForLevel(skillLevelFromProgress(p));
}
