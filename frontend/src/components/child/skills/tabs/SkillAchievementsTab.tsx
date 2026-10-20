import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Lock, Pin, Trophy } from 'lucide-react';
import { api } from '../../../../api/client';
import { ChildAchievementGroupDto, SkillId, SkillTotalDto } from '../../../../api/types';
import { errMsg } from '../../../../lib/format';
import { tierForLevel } from '../../../../lib/achievementTiers';
import { EmptyState, Spinner } from '../../../ui';

const TARGET_UNITS: Record<string, string> = {
  READING_BOOKS: 'книг',
  READING_PAGES: 'страниц',
  READING_GENRES: 'жанров',
  READING_SERIES: 'серий',
  READING_HEAVY_BOOKS: 'книг > 600 стр',
  READING_STREAK: 'дней подряд',
};

function unitFor(targetType: string): string {
  if (targetType.startsWith('READING_GENRE_')) return 'книг';
  return TARGET_UNITS[targetType] ?? 'шт.';
}

/** Достижения конкретного навыка ребёнка (вкладка внутри модуля навыка). */
export default function SkillAchievementsTab({ skill }: { skill: SkillId }) {
  const [groups, setGroups] = useState<ChildAchievementGroupDto[] | null>(null);
  const [totals, setTotals] = useState<SkillTotalDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hideIncomplete, setHideIncomplete] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const list = await api.get<ChildAchievementGroupDto[]>('/child/achievements');
      setGroups(list.filter((a) => a.skill === skill));
    } catch (e) {
      setError(errMsg(e));
      setGroups([]);
    }
  }, [skill]);

  const loadTracked = useCallback(async () => {
    try {
      const ids = await api.get<number[]>('/child/achievements/tracked');
      setTrackedIds(new Set(ids));
    } catch {
      setTrackedIds(new Set());
    }
  }, []);

  const loadTotals = useCallback(async () => {
    try {
      setTotals(await api.get<SkillTotalDto[]>('/child/achievements/totals'));
    } catch {
      setTotals([]);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadTracked();
    void loadTotals();
  }, [load, loadTracked, loadTotals]);

  const toggleTrack = async (achievementId: number) => {
    try {
      const tracked = await api.post<boolean>(`/child/achievements/${achievementId}/track`);
      setTrackedIds((prev) => {
        const next = new Set(prev);
        if (tracked) next.add(achievementId);
        else next.delete(achievementId);
        return next;
      });
    } catch (e) {
      alert(errMsg(e));
    }
  };

  if (error) return <div className="rpg-panel p-4 text-sm text-rose-300">{error}</div>;

  if (groups === null) return <Spinner label="Загружаем достижения…" />;

  if (groups.length === 0) {
    return (
      <EmptyState
        title="Достижений по этому навыку пока нет"
        hint="Родители создадут их — и ты сможешь их получать!"
        icon={<Trophy size={40} />}
      />
    );
  }

  const visible = groups.filter((a) => !hideIncomplete || a.unlocked);
  const unlockedCount = groups.filter((a) => a.unlocked).length;
  const skillTotal = totals.find((t) => t.skill === skill) ?? { total: 0, unlocked: 0 };
  const progressPct = skillTotal.total > 0 ? Math.min(100, Math.round((skillTotal.unlocked / skillTotal.total) * 100)) : 0;

  return (
    <div className="space-y-3">
      {/* Полоска прогресса по навыку: каждая ступень — отдельное достижение */}
      {skillTotal.total > 0 && (
        <div className="rpg-panel p-3">
          <div className="mb-1 flex items-center justify-between text-xs text-stone-400">
            <span>🏆 Получено {skillTotal.unlocked} из {skillTotal.total} ступеней</span>
            <span className={progressPct === 100 ? 'font-bold text-emerald-300' : ''}>{progressPct}%</span>
          </div>
          <div className="rpg-progress-track h-2.5">
            <div
              className={progressPct === 100 ? 'rpg-progress-fill !bg-emerald-400' : 'rpg-progress-fill'}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-stone-400">
          {unlockedCount} из {groups.length} групп в этом навыке
        </span>
        <button
          onClick={() => setHideIncomplete((v) => !v)}
          className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
        >
          {hideIncomplete ? <EyeOff size={14} /> : <Eye size={14} />}
          {hideIncomplete ? 'Показать невыполненные' : 'Скрыть невыполненные'}
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Ничего не найдено" hint="Все достижения этого навыка получены — невероятно!" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((a) => {
            const tier = tierForLevel(a.level);
            const hasTarget = a.targetType && a.targetType !== 'NONE' && a.targetValue > 0;
            const percent = hasTarget ? Math.min(100, Math.round((a.progress / a.targetValue) * 100)) : 0;
            const tracked = trackedIds.has(a.achievementId);
            return (
              <div
                key={a.achievementId}
                className={`rpg-panel relative overflow-hidden p-3.5 ${a.unlocked ? tier.border : ''}`}
              >
                {tracked && (
                  <Pin size={14} className="absolute right-2 top-2 text-amber-300" fill="currentColor" />
                )}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-white ${tier.iconBox}`}
                  >
                    {a.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-bold text-amber-100">{a.name}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tier.badge}`}>
                        {a.level === 0 ? 'Одиночное' : `Ур. ${a.level}`} · {tier.name}
                      </span>
                    </div>
                    {!a.questBooks && (
                      <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-stone-400">
                        {a.description}
                      </p>
                    )}

                    {/* Чек-лист серийного книжного квеста (зелёный — прочитана) */}
                    {a.questBooks && a.questRead && (
                      <div className="mt-2 rounded-xl bg-stone-900/70 p-2">
                        <div className="mb-1 text-[11px] font-semibold text-stone-400">
                          📋 Книги серии: {a.questRead.filter(Boolean).length}/{a.questBooks.length} прочитано
                        </div>
                        <ul className="space-y-1">
                          {a.questBooks.map((title, i) => {
                            const done = a.questRead?.[i] ?? false;
                            return (
                              <li
                                key={`${a.achievementId}-${i}`}
                                className={`flex items-center gap-1.5 text-xs ${
                                  done ? 'text-emerald-300' : 'text-stone-500'
                                }`}
                              >
                                {done ? (
                                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                                ) : (
                                  <span className="inline-block h-3 w-3 shrink-0 rounded-sm border border-stone-600" />
                                )}
                                <span className={done ? 'opacity-80' : ''}>{title}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {hasTarget && (
                      <div className="mt-2">
                        <div className="mb-0.5 flex justify-between text-[11px] text-stone-400">
                          <span>
                            {a.levelName} · {a.progress}
                          </span>
                          <span>
                            из {a.targetValue} {unitFor(a.targetType)}
                          </span>
                        </div>
                        <div className="rpg-progress-track h-2">
                          <div
                            className={a.unlocked ? 'rpg-progress-fill !bg-emerald-400' : 'rpg-progress-fill'}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      {a.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 size={14} /> Получено!
                        </span>
                      ) : a.hiddenReward ? (
                        <span className="inline-flex items-center gap-1 text-xs text-fuchsia-300">
                          <Lock size={13} /> Награда скрыта
                        </span>
                      ) : null}
                      <button
                        onClick={() => void toggleTrack(a.achievementId)}
                        className={`ml-auto inline-flex items-center gap-1 text-xs transition ${
                          tracked ? 'text-amber-300' : 'text-stone-500 hover:text-amber-200'
                        }`}
                      >
                        <Pin size={13} />
                        {tracked ? 'Отслеживается' : 'Отслеживать'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}