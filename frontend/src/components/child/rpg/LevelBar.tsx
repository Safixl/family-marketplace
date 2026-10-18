import { rankTier } from '../../../lib/achievementTiers';
import { RpgLevel, RANKS, MAX_LEVEL } from '../../../lib/rpg';

interface Props {
  level: RpgLevel;
  compact?: boolean;
}

export default function LevelBar({ level, compact }: Props) {
  const isMax = level.level >= MAX_LEVEL;
  const percent = isMax ? 100 : Math.round(level.ratio * 100);
  const currentRank = RANKS.filter((r) => r.min <= level.level).pop() ?? RANKS[0];
  const tier = rankTier(currentRank.min);

  // Маркер «Неизвестная награда»: если следующий уровень повышает ранг.
  const nextRank = RANKS.find((r) => r.min === level.level + 1);

  return (
    <div className="rpg-panel rpg-panel-gold px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2 border-amber-500/70 bg-gradient-to-b from-amber-900 to-stone-900 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300/80">Ур.</span>
          <span className="text-lg font-extrabold leading-none text-amber-300">{level.level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className={`rpg-badge border ${tier.badge}`}>
              {level.rankEmoji} {level.rank}
            </span>
            {!compact && (
              <span className="shrink-0 text-xs font-semibold text-amber-100/70">
                {isMax ? '🏆 Максимальный уровень' : `${level.xpInLevel} / ${level.xpToNext} опыта`}
              </span>
            )}
          </div>

          {/* Шильдик «Неизвестная награда за достижения N-уровня» */}
          {nextRank && (
            <div className="mt-1.5 flex justify-center">
              <span className="rounded-full border border-fuchsia-400/50 bg-fuchsia-500/15 px-3 py-0.5 text-[11px] font-bold text-fuchsia-300">
                🎁 Неизвестная награда за достижения {nextRank.min}-уровня
              </span>
            </div>
          )}

          <div className="rpg-progress-track mt-1.5 h-3">
            <div
              className={isMax ? 'rpg-progress-fill !bg-gradient-to-r !from-amber-400 !via-yellow-300 !to-amber-500' : 'rpg-progress-fill'}
              style={{ width: `${percent}%` }}
            />
          </div>
          {!compact && (
            <div className="mt-1 text-right text-[11px] font-medium text-amber-100/50">
              {isMax
                ? 'Ты достиг вершины — Чемпион! 👑'
                : `до следующего уровня: ${level.xpToNext - level.xpInLevel} опыта`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
