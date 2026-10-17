import { Crown } from 'lucide-react';
import { RpgLevel, RANKS, MAX_LEVEL } from '../../../lib/rpg';
import { rankTier } from '../../../lib/achievementTiers';

interface Props {
  level: RpgLevel;
}

/**
 * Витрина рангов «Твой путь»: показываются только уже открытые ранги.
 * Будущие ранги и количество оставшихся уровней до нового ранга скрыты —
 * для ребёнка это всегда неожиданность (спойлеров нет).
 */
export default function RankLadder({ level }: Props) {
  const currentIndex = RANKS.findIndex((r) => r.min <= level.level);
  const current = RANKS[Math.max(0, currentIndex)];
  const discovered = RANKS.slice(0, currentIndex + 1);
  const isMax = level.level >= MAX_LEVEL;
  const percent = Math.min(100, Math.round(((currentIndex + 1) / RANKS.length) * 100));

  return (
    <div className="rpg-panel rpg-panel-gold p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-bold text-amber-200">
          <Crown size={18} className="text-amber-400" /> Твой путь
        </h3>
        <span className={`rpg-badge border ${rankTier(current.min).badge}`}>
          {current.emoji} {current.name} · ур. {level.level}
        </span>
      </div>

      {/* Дорожка: только открытые ранги + один загадочный «?» */}
      <div className="relative">
        <div className="absolute left-2 right-2 top-[22px] h-1.5 rounded-full bg-stone-800" />
        <div
          className="absolute left-2 top-[22px] h-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-500"
          style={{ width: `calc(${percent}% - 16px)` }}
        />
        <div className="relative flex items-start gap-1 overflow-x-auto pb-1">
          {discovered.map((r) => {
            const tier = rankTier(r.min);
            const active = r.min === current.min;
            return (
              <div key={r.min} className="flex min-w-[52px] flex-col items-center gap-1.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-xl ${
                    tier.medal
                  } ${tier.glow ?? ''} ${
                    active ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-stone-900' : 'border-white/30'
                  }`}
                >
                  {r.emoji}
                </div>
                <span
                  className={`text-center text-[9px] font-bold leading-tight ${
                    active ? 'text-amber-200' : 'text-amber-200/80'
                  }`}
                >
                  {r.name}
                </span>
              </div>
            );
          })}
          {!isMax && (
            <div className="flex min-w-[52px] flex-col items-center gap-1.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-amber-500/50 bg-stone-900/80 text-lg font-extrabold text-amber-300">
                ?
              </div>
              <span className="text-center text-[9px] font-bold text-amber-300">???</span>
            </div>
          )}
        </div>
      </div>

      {/* Загадочная подсказка без цифр и имён */}
      <div className="mt-3 text-right text-xs font-medium text-amber-100/60">
        {isMax ? (
          <span className="font-bold text-amber-300">Ты достиг вершины! 👑</span>
        ) : (
          <span>Что-то новое ждёт тебя впереди… 🔮</span>
        )}
      </div>
    </div>
  );
}