import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Sparkles, Swords, Trophy } from 'lucide-react';

export type HomeWidgetId = 'balances' | 'stats' | 'achievements' | 'orders';

export const HOME_WIDGETS: Array<{ id: HomeWidgetId; label: string; emoji: string }> = [
  { id: 'balances', label: 'Мои баллы', emoji: '💰' },
  { id: 'stats', label: 'Статистика', emoji: '📊' },
  { id: 'achievements', label: 'Достижения', emoji: '🏆' },
  { id: 'orders', label: 'Последние заказы', emoji: '📦' },
];
import {
  ChildAchievementGroupDto,
  ChildBookDto,
  ChildReadingResponse,
  SkillId,
  SkillProgressDto,
} from '../../api/types';
import { api } from '../../api/client';
import { errMsg } from '../../lib/format';
import { rankTier, tierForLevel } from '../../lib/achievementTiers';
import { RANKS, RpgLevel } from '../../lib/rpg';
import { EmptyState } from '../ui';
import ChildHouseView from './ChildHouseView';
import LevelBar from './rpg/LevelBar';
import SkillHexagon from './rpg/SkillHexagon';
import LimitsPanel from './LimitsPanel';

interface Props {
  achievements: ChildAchievementGroupDto[];
  skills: SkillProgressDto[];
  level: RpgLevel;
  homeStoreId: number | null;
  onNavigate: (tab: string) => void;
  onOpenSkill: (skill: SkillId) => void;
}

export default function ChildHomeTab({
  achievements,
  skills,
  level,
  homeStoreId,
  onNavigate,
  onOpenSkill,
}: Props) {
  const currentRank = RANKS.filter((r) => r.min <= level.level).pop() ?? RANKS[0];

  // Книги «Читаю сейчас»
  const [reading, setReading] = useState<ChildReadingResponse | null>(null);
  const [pageInput, setPageInput] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);

  // Отслеживаемые достижения
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());

  const loadReading = useCallback(async () => {
    try {
      setReading(await api.get<ChildReadingResponse>('/child/reading'));
    } catch {
      setReading(null);
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
    void loadReading();
    void loadTracked();
  }, [loadReading, loadTracked]);

  // Все книги, которые ещё не зачтены (в т.ч. без закладки) — статус «Читаю сейчас»
  const readingBooks = (reading?.books ?? []).filter((b) => b.status !== 'APPROVED');

  const savePage = async (book: ChildBookDto) => {
    const page = Number(pageInput[book.id]);
    if (!page || page <= 0) {
      alert('Укажите страницу');
      return;
    }
    if (page < (book.currentPage ?? 0)) {
      alert('Страница не может быть меньше текущей');
      return;
    }
    if (book.pages > 0 && page > book.pages) {
      alert(`В книге всего ${book.pages} страниц`);
      return;
    }
    setBusy(true);
    try {
      await api.post(`/child/books/${book.id}/bookmark`, { page });
      setPageInput((prev) => ({ ...prev, [book.id]: '' }));
      await loadReading();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const markRead = async (book: ChildBookDto) => {
    setBusy(true);
    try {
      await api.post(`/child/books/${book.id}/read`);
      await loadReading();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const trackedAchievements = achievements.filter((a) => trackedIds.has(a.achievementId));

  return (
    <div className="space-y-6">
      {/* Верхний блок: слева опыт + лимиты, справа карта навыков */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <LevelBar level={level} compact />
          <section className="rpg-panel rpg-panel-gold p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-amber-200">
              <Sparkles size={18} className="text-amber-400" /> Лимиты дня
            </h2>
            <LimitsPanel />
          </section>
        </div>

        <section className="rpg-panel rpg-panel-gold p-4 sm:p-6 lg:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-200">
              <Swords size={20} className="text-amber-400" /> Карта навыков
            </h2>
            <div className="flex items-center gap-2">
              <span className={`rpg-badge border ${rankTier(currentRank.min).badge}`}>
                {level.rankEmoji} {level.rank} · ур. {level.level}
              </span>
              <button
                onClick={() => onNavigate('skills')}
                className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
              >
                Все навыки
              </button>
            </div>
          </div>
          <p className="mb-3 text-sm text-stone-400">
            Нажми на вершину шестиугольника, чтобы открыть модуль навыка.
          </p>
          <SkillHexagon skills={skills} onSelect={onOpenSkill} />
        </section>
      </div>

      {/* Календарь уборки */}
      {homeStoreId != null && (
        <section className="rpg-panel rpg-panel-gold p-4 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-200">
            <CalendarDays size={20} className="text-amber-400" /> Календарь уборки
          </h2>
          <ChildHouseView storeId={homeStoreId} />
        </section>
      )}

      {/* Читаю сейчас */}
      {readingBooks.length > 0 && (
        <section className="rpg-panel rpg-panel-gold p-4 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-200">
            <BookOpen size={20} className="text-amber-400" /> Читаю сейчас
          </h2>
          <div className="space-y-3">
            {readingBooks.map((book) => (
              <div key={book.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-stone-900/60 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-amber-100">{book.name}</div>
                  <div className="text-sm text-sky-300">
                    Стр. {book.currentPage ?? 0}/{book.pages}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={book.currentPage ?? 1}
                    max={book.pages || undefined}
                    className="rpg-input w-24"
                    placeholder="стр."
                    value={pageInput[book.id] ?? ''}
                    onChange={(e) => setPageInput((prev) => ({ ...prev, [book.id]: e.target.value }))}
                  />
                  <button
                    className="rpg-btn !px-3 !py-1.5 text-xs"
                    disabled={busy || !pageInput[book.id]}
                    onClick={() => void savePage(book)}
                  >
                    Дочитал до
                  </button>
                  <button
                    className="rpg-btn !px-3 !py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => void markRead(book)}
                  >
                    <CheckCircle2 size={14} /> Прочитал
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Отслеживаемые достижения */}
      {trackedAchievements.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-200">
              <Trophy size={20} className="text-amber-400" /> Мои цели
            </h2>
            <button
              onClick={() => onNavigate('achievements')}
              className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
            >
              Все достижения
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trackedAchievements.map((a) => {
              const tier = tierForLevel(a.level);
              const percent = a.targetValue > 0 ? Math.min(100, Math.round((a.progress / a.targetValue) * 100)) : 0;
              return (
                <div key={a.achievementId} className="rpg-panel flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg text-white ${tier.iconBox}`}>
                      {a.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-amber-100">{a.name}</div>
                      <div className="text-xs text-stone-400">
                        {Math.min(a.progress, a.targetValue)} из {a.targetValue}
                      </div>
                    </div>
                  </div>
                  <div className="rpg-progress-track h-2">
                    <div className="rpg-progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {trackedAchievements.length === 0 && readingBooks.length === 0 && (
        <EmptyState
          title="Главная пуста"
          hint="Отметь достижения галочкой «отслеживать» — они появятся здесь"
        />
      )}
    </div>
  );
}
