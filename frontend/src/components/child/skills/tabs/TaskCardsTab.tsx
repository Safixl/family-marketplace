import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock3, Send, Sparkles } from 'lucide-react';
import { api } from '../../../../api/client';
import { TaskCardDto } from '../../../../api/types';
import { errMsg } from '../../../../lib/format';
import { EmptyState, Spinner } from '../../../ui';
import MathCardView from './MathCardView';

interface Props {
  skill: 'MATH' | 'HOUSE';
}

const RARITY_META: Record<string, { label: string; cls: string }> = {
  COMMON: { label: 'Обычная', cls: 'border-slate-400/50 bg-slate-500/15 text-slate-300' },
  RARE: { label: 'Редкая', cls: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300' },
  UNCOMMON: { label: 'Раритетная', cls: 'border-sky-400/50 bg-sky-500/15 text-sky-300' },
  EPIC: { label: 'Эпическая', cls: 'border-violet-400/50 bg-violet-500/15 text-violet-300' },
  LEGENDARY: { label: 'Легендарная', cls: 'border-orange-400/50 bg-orange-500/15 text-orange-300' },
};

const DIFFICULTY_META: Record<string, { label: string; emoji: string }> = {
  EASY: { label: 'Лёгкая', emoji: '🟢' },
  MEDIUM: { label: 'Средняя', emoji: '🟡' },
  HARD: { label: 'Сложная', emoji: '🔴' },
};

/**
 * «Карточки с заданиями»: карты разной сложности и вознаграждения.
 * 1 карта в день (MATH), остальные блокируются; запрос родителю → раскрытие
 * карты и старт таймера; награда — при результате не ниже порога.
 */
export default function TaskCardsTab({ skill }: Props) {
  const [cards, setCards] = useState<TaskCardDto[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  const timerRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      setCards(await api.get<TaskCardDto[]>(`/child/task-cards?skill=${skill}`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, [skill]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
    };
  }, []);

  const take = async (cardId: number) => {
    setBusy(true);
    try {
      await api.post(`/child/task-cards/${cardId}/take`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (card: TaskCardDto) => {
    setBusy(true);
    try {
      const list = card.tasks.map((_, i) => answers[`${card.id}-${i}`] ?? '');
      if (card.childCardId == null) return;
      await api.post(`/child/task-cards/${card.childCardId}/submit`, { answers: list });
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (!cards) return <Spinner label="Загружаем карточки…" />;

  if (cards.length === 0 && skill !== 'MATH') {
    return (
      <EmptyState
        title="Карточек пока нет"
        hint="Родитель создаст карточки с заданиями — они появятся здесь"
        icon={<Sparkles size={40} />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {skill === 'MATH' && <MathCardView onDone={() => void load()} />}
      {cards.map((card) => {
        const status = card.childStatus;
        const rarity = RARITY_META[card.rarity] ?? RARITY_META.COMMON;
        const difficulty = DIFFICULTY_META[card.difficulty] ?? DIFFICULTY_META.EASY;
        const revealed = status === 'REVEALED' || status === 'IN_PROGRESS';
        const deadline =
          revealed && card.startedAt
            ? new Date(new Date(card.startedAt).getTime() + card.durationMinutes * 60_000).getTime()
            : null;
        const remaining = deadline ? Math.max(0, Math.floor((deadline - Date.now()) / 1000)) : null;

        return (
          <div key={card.id} className="rpg-panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-bold text-amber-100">
                  <span className="text-xl">{card.icon}</span> {card.title}
                  <span className="rpg-badge border border-stone-500/30 bg-stone-500/15 text-stone-300">
                    {difficulty.emoji} {difficulty.label}
                  </span>
                  <span className={`rpg-badge border ${rarity.cls}`}>{rarity.label}</span>
                </div>
                {card.description && <div className="mt-0.5 text-sm text-stone-400">{card.description}</div>}
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rpg-badge border border-violet-500/30 bg-violet-500/15 text-violet-300">
                    ⏱ {card.durationMinutes} мин
                  </span>
                  {card.hiddenReward ? (
                    <span className="rpg-badge border border-amber-500/30 bg-amber-500/15 text-amber-300">
                      🎁 Скрытая награда · {rarity.label}
                    </span>
                  ) : (
                    card.rewardAmount > 0 &&
                    card.currencyIcon && (
                      <span className="rpg-badge border border-amber-500/30 bg-amber-500/15 text-amber-300">
                        {card.currencyIcon} +{card.rewardAmount} {card.currencyName}
                      </span>
                    )
                  )}
                  {card.houseBonus > 0 && (
                    <span className="rpg-badge border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                      🏠 +{card.houseBonus} к помощи
                    </span>
                  )}
                  {card.xpReward > 0 && (
                    <span className="rpg-badge border border-sky-500/30 bg-sky-500/15 text-sky-300">
                      +{card.xpReward} XP
                    </span>
                  )}
                </div>
                {remaining != null && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Clock3 size={12} /> осталось: {Math.floor(remaining / 60)} мин {remaining % 60} с
                  </div>
                )}
                {status === 'DONE' && (
                  <div className="mt-1.5 text-xs font-bold text-emerald-300">
                    ✅ Выполнено · {card.resultPercent}% (нужно {card.successPercent}%)
                  </div>
                )}
                {status === 'FAILED' && (
                  <div className="mt-1.5 text-xs font-bold text-rose-300">
                    ❌ Не выполнено · {card.resultPercent}% (нужно {card.successPercent}%)
                  </div>
                )}
              </div>

              {!status && (
                <button className="rpg-btn" disabled={busy} onClick={() => void take(card.id)}>
                  <Send size={15} /> Взять карточку
                </button>
              )}
              {status === 'PENDING_PARENT' && (
                <span className="rpg-badge border border-amber-500/40 bg-amber-500/15 text-amber-300">
                  <Clock3 size={11} /> Ждёт одобрения родителя
                </span>
              )}
              {revealed && (
                <button className="rpg-btn" disabled={busy} onClick={() => void submit(card)}>
                  <Send size={15} /> Сдать
                </button>
              )}
            </div>

            {revealed && (
              <div className="mt-3 space-y-2 rounded-xl bg-stone-900/60 p-3">
                {card.tasks.map((task, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 text-sm text-stone-200">{task.q}</span>
                    <input
                      className="rpg-input w-40"
                      placeholder="Ответ"
                      value={answers[`${card.id}-${i}`] ?? ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [`${card.id}-${i}`]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}