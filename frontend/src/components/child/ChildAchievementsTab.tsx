import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Gift, Lock, Pin, Trophy } from 'lucide-react';
import { api } from '../../api/client';
import { ChildAchievementGroupDto, SkillId, SkillTotalDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { tierForLevel } from '../../lib/achievementTiers';
import { SKILLS } from '../../lib/skills';
import { EmptyState, Spinner } from '../ui';

const TARGET_UNITS: Record<string, string> = {
  READING_BOOKS: 'книг',
  READING_PAGES: 'страниц',
  READING_GENRES: 'жанров',
  READING_SERIES: 'серий',
  READING_HEAVY_BOOKS: 'книг > 600 стр',
  MATH_CARDS: 'работ',
  MATH_TASKS: 'задач',
  POINTS_EARNED: 'баллов',
  MATH_STREAK: 'дней подряд',
  HOUSE_CLEAN_STREAK: 'дней подряд',
  HOUSE_HELP_STREAK: 'дней подряд',
  HOME_PURCHASES: 'товаров',
};

type Filter = 'ALL' | SkillId | 'NONE';

export default function ChildAchievementsTab() {
  const [achievements, setAchievements] = useState<ChildAchievementGroupDto[] | null>(null);
  const [totals, setTotals] = useState<SkillTotalDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [hideIncomplete, setHideIncomplete] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const [list, totalsList] = await Promise.all([
        api.get<ChildAchievementGroupDto[]>('/child/achievements'),
        api.get<SkillTotalDto[]>('/child/achievements/totals').catch(() => [] as SkillTotalDto[]),
      ]);
      setAchievements(list);
      setTotals(totalsList);
    } catch (e) {
      setError(errMsg(e));
      setAchievements([]);
    }
  }, []);

  const loadTracked = useCallback(async () => {
    try {
      const ids = await api.get<number[]>('/child/achievements/tracked');
      setTrackedIds(new Set(ids));
    } catch {
      setTrackedIds(new Set());
    }
  }, []);

  useEffect(() => {
    void load();
    void loadTracked();
  }, [load, loadTracked]);

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

  const filtered = useMemo(() => {
    if (!achievements) return [];
    return achievements.filter((a) => {
      if (hideIncomplete && !a.unlocked) return false;
      if (filter === 'ALL') return true;
      if (filter === 'NONE') return !a.skill;
      return a.skill === filter;
    });
  }, [achievements, filter, hideIncomplete]);

  if (error) return <div className="rpg-panel p-4 text-sm text-rose-300">{error}</div>;

  if (achievements === null) return <Spinner label="Загружаем достижения…" />;

  if (achievements.length === 0) {
    return (
      <EmptyState
        title="Достижений пока нет"
        hint="Родители создадут их для тебя — и ты сможешь их получать!"
        icon={<Trophy size={40} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="rpg-title text-xl">Достижения</h2>
        <span className="text-sm text-stone-400">
          {achievements.filter((a) => a.unlocked).length} из {achievements.length} получено
        </span>
      </div>

      {/* Полоска прогресса: каждая ступень — отдельное достижение */}
      {(() => {
        const prog =
          filter === 'ALL'
            ? totals.reduce((acc, t) => ({ total: acc.total + t.total, unlocked: acc.unlocked + t.unlocked }), { total: 0, unlocked: 0 })
            : totals.find((t) => t.skill === filter) ?? { total: 0, unlocked: 0 };
        const pct = prog.total > 0 ? Math.min(100, Math.round((prog.unlocked / prog.total) * 100)) : 0;
        return (
          <div className="rpg-panel p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-stone-400">
              <span>
                🏆 Получено {prog.unlocked} из {prog.total} ступеней
              </span>
              <span className={pct === 100 ? 'font-bold text-emerald-300' : ''}>{pct}%</span>
            </div>
            <div className="rpg-progress-track h-2.5">
              <div
                className={pct === 100 ? 'rpg-progress-fill !bg-emerald-400' : 'rpg-progress-fill'}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Фильтры по направлениям */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('ALL')}
          className={`rpg-tab ${filter === 'ALL' ? 'rpg-tab-active' : ''}`}
        >
          Все
        </button>
        {SKILLS.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`rpg-tab ${filter === s.id ? 'rpg-tab-active' : ''}`}
          >
            {s.icon} {s.name}
          </button>
        ))}
        <button
          onClick={() => setFilter('NONE')}
          className={`rpg-tab ${filter === 'NONE' ? 'rpg-tab-active' : ''}`}
        >
          Без навыка
        </button>
      </div>

      {/* Переключатель невыполненных */}
      <button
        onClick={() => setHideIncomplete((v) => !v)}
        className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
      >
        {hideIncomplete ? <EyeOff size={14} /> : <Eye size={14} />}
        {hideIncomplete ? 'Показать невыполненные' : 'Скрыть невыполненные'}
      </button>

      {filtered.length === 0 ? (
        <EmptyState title="Ничего не найдено" hint="Попробуйте изменить фильтр" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((achievement) => {
            const tier = tierForLevel(achievement.level);
            const hasTarget = achievement.targetType && achievement.targetType !== 'NONE';
            const percent = hasTarget
              ? Math.min(100, Math.round((achievement.progress / achievement.targetValue) * 100))
              : 0;
            const done = hasTarget && achievement.progress >= achievement.targetValue;
            return (
              <div
                key={achievement.achievementId}
                className={`rpg-panel flex flex-col gap-3 p-4 ${
                  achievement.unlocked ? `${tier.border} ${tier.glow ?? ''}` : 'border-stone-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 shrink-0">
                    {hasTarget && (
                      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
                        <circle cx="24" cy="24" r="21" fill="none" strokeWidth="3.5" className="stroke-stone-700" />
                        <circle
                          cx="24"
                          cy="24"
                          r="21"
                          fill="none"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke={done || achievement.unlocked ? '#10b981' : '#fbbf24'}
                          strokeDasharray={`${(percent / 100) * 132} 132`}
                        />
                      </svg>
                    )}
                    <span
                      className={`absolute inset-[3px] flex items-center justify-center rounded-full text-xl text-white ${
                        achievement.unlocked ? tier.iconBox : 'bg-stone-800'
                      }`}
                    >
                      {achievement.unlocked ? achievement.icon : <Lock size={17} />}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-amber-100">
                      {achievement.unlocked ? achievement.levelName : achievement.name}
                      {achievement.level > 0 && !achievement.unlocked && (
                        <span className="ml-1 text-xs font-normal text-stone-400">
                          · уровень {achievement.level + 1}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className={`rpg-badge border ${tier.badge}`}>
                        {tier.emoji} {tier.name}
                      </span>
                      {achievement.rewardAmount != null && achievement.rewardAmount > 0 && (
                        <span className="rpg-badge border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                          <Gift size={12} /> {fmtAmount(achievement.rewardAmount)}
                        </span>
                      )}
                      {achievement.rewardAmount == null && (
                        <span className="rpg-badge border border-stone-500/30 bg-stone-500/15 text-stone-300">
                          награда скрыта 🤫
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {achievement.unlocked && (
                      <span className="rpg-badge border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                        <CheckCircle2 size={13} /> получено
                      </span>
                    )}
                    <button
                      onClick={() => void toggleTrack(achievement.achievementId)}
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                        trackedIds.has(achievement.achievementId)
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-stone-800 text-stone-400 hover:text-amber-200'
                      }`}
                      title={trackedIds.has(achievement.achievementId) ? 'Убрать с главной' : 'Отслеживать на главной'}
                    >
                      <Pin size={12} /> {trackedIds.has(achievement.achievementId) ? 'Отслеживаю' : 'Отслеживать'}
                    </button>
                  </div>
                </div>

                {!achievement.questBooks && achievement.description && (
                  <p className="text-sm text-stone-400">{achievement.description}</p>
                )}

                {/* Чек-лист серийного книжного квеста (зелёный — прочитана) */}
                {achievement.questBooks && achievement.questRead && (
                  <div className="rounded-xl bg-stone-900/70 p-2">
                    <div className="mb-1 text-[11px] font-semibold text-stone-400">
                      📋 Книги серии: {achievement.questRead.filter(Boolean).length}/{achievement.questBooks.length} прочитано
                    </div>
                    <ul className="space-y-1">
                      {achievement.questBooks.map((title, i) => {
                        const done = achievement.questRead?.[i] ?? false;
                        return (
                          <li
                            key={`${achievement.achievementId}-${i}`}
                            className={`flex items-center gap-1.5 text-xs ${done ? 'text-emerald-300' : 'text-stone-500'}`}
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
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-stone-400">
                      <span>
                        Прогресс: {Math.min(achievement.progress, achievement.targetValue)} из{' '}
                        {achievement.targetValue} {TARGET_UNITS[achievement.targetType] ?? ''}
                      </span>
                      {done && !achievement.unlocked && (
                        <span className="font-semibold text-amber-300">цель достигнута!</span>
                      )}
                      {done && achievement.unlocked && (
                        <span className="font-semibold text-emerald-300">выполнено</span>
                      )}
                    </div>
                    <div className="rpg-progress-track h-2">
                      <div
                        className={`h-full rounded-full ${done ? 'bg-emerald-500' : 'rpg-progress-fill'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
