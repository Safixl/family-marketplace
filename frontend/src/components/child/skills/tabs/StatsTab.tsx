import { CheckCircle2, ListChecks, Swords } from 'lucide-react';
import { SkillConfig, SkillQuest, SkillStats } from '../../../../lib/skills';
import { skillRank } from '../../../../lib/rpg';
import { EmptyState } from '../../../ui';

interface Props {
  config: SkillConfig;
  stats: SkillStats;
  quests: SkillQuest[];
}

export default function StatsTab({ config, stats, quests }: Props) {
  const rank = skillRank(stats.progress);

  return (
    <div className="space-y-4">
      {/* Индикатор уровня навыка */}
      <div className="rpg-panel rpg-panel-gold p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-900 to-stone-900 text-3xl">
            {config.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="rpg-title text-lg">{config.name}</span>
              <span className="text-sm font-bold text-amber-200">
                {rank.emoji} {rank.name}
              </span>
            </div>
            <div className="rpg-progress-track mt-2 h-3">
              <div
                className="rpg-progress-fill"
                style={{ width: `${Math.min(100, stats.progress)}%` }}
              />
            </div>
            <div className="mt-1 text-right text-xs font-semibold text-amber-100/60">
              {stats.progress}% · уровень {Math.max(1, Math.floor(stats.progress / 10) + 1)}
            </div>
          </div>
        </div>
      </div>

      {/* Счётчики */}
      {stats.counters.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.counters.map((c) => (
            <div key={c.label} className="rpg-stat p-3 text-center">
              <div className="text-2xl">{c.icon}</div>
              <div className="mt-1 text-xl font-extrabold text-amber-200">{c.value}</div>
              <div className="mt-0.5 text-[11px] font-medium leading-tight text-stone-400">
                {c.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Квесты родителя */}
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-200">
          <Swords size={16} /> Текущие квесты по направлению
        </h3>
        {quests.length === 0 ? (
          <EmptyState title="Квестов пока нет" hint="Родитель создаст квесты для этого направления" />
        ) : (
          <div className="space-y-2">
            {quests.map((q) => (
              <div key={q.id} className="rpg-panel flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
                  <ListChecks size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-amber-100">{q.title}</div>
                  {q.description && (
                    <div className="truncate text-xs text-stone-400">{q.description}</div>
                  )}
                </div>
                <div className="shrink-0 text-sm font-bold text-amber-300">+{q.points}</div>
                {q.done && (
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
