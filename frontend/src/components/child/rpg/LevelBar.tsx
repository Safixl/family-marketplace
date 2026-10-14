import { RpgLevel } from '../../../lib/rpg';

interface Props {
  level: RpgLevel;
  compact?: boolean;
}

export default function LevelBar({ level, compact }: Props) {
  const percent = Math.round(level.ratio * 100);
  return (
    <div className="rpg-panel rpg-panel-gold px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2 border-amber-500/70 bg-gradient-to-b from-amber-900 to-stone-900 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300/80">Ур.</span>
          <span className="text-lg font-extrabold leading-none text-amber-300">{level.level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-bold text-amber-200">
              {level.rankEmoji} {level.rank}
            </span>
            {!compact && (
              <span className="shrink-0 text-xs font-semibold text-amber-100/70">
                {level.xpInLevel} / {level.xpToNext} опыта
              </span>
            )}
          </div>
          <div className="rpg-progress-track mt-1.5 h-3">
            <div className="rpg-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          {!compact && (
            <div className="mt-1 text-right text-[11px] font-medium text-amber-100/50">
              до следующего уровня: {level.xpToNext - level.xpInLevel} опыта
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
