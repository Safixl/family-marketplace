import { useCallback, useEffect, useState } from 'react';
import { Check, Clock3, Send, X } from 'lucide-react';
import { api } from '../../../../api/client';
import { MathCardDayDto, MathCardDto, MathCardSubmitResult, MathChoice } from '../../../../api/types';
import { errMsg } from '../../../../lib/format';
import { Spinner } from '../../../ui';

const CHOICES: Array<{ choice: MathChoice; label: string; emoji: string; minutes: number }> = [
  { choice: 'EASY', label: 'Легкая', emoji: '🟢', minutes: 30 },
  { choice: 'MEDIUM', label: 'Обычная', emoji: '⚪', minutes: 35 },
  { choice: 'HIGH', label: 'Высокая', emoji: '🔵', minutes: 40 },
  { choice: 'HARD', label: 'Сложная', emoji: '🟣', minutes: 45 },
  { choice: 'EXTREME', label: 'Хард', emoji: '🔴', minutes: 50 },
  { choice: 'OLYMPIAD', label: 'Олимпиада', emoji: '🟠', minutes: 60 },
];

const TYPE_LABELS: Record<string, string> = {
  CALC: '🔢 Примеры',
  EQUATION: '⚖️ Уравнения',
  TEXT: '📝 Текстовые',
};

/**
 * Динамические математические карточки (ребёнок). До 3 карточек в день (сброс в 9:00).
 * Карточки отсортированы по сложности. Жизненный цикл: взять → одобрение родителя →
 * начать (единый серверный таймер) → отправить на проверку.
 * После лимита решённые карточки остаются со статусами и наградами, скрываются только не взятые.
 */
export default function MathCardView({ onDone }: { onDone?: () => void }) {
  const [day, setDay] = useState<MathCardDayDto | null>(null);
  const [generating, setGenerating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<MathCardSubmitResult | null>(null);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      setDay(await api.get<MathCardDayDto>('/child/math-cards'));
    } catch (e) {
      alert(errMsg(e));
      setDay({ cards: [], doneToday: 0, dailyLimit: 3 });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const generate = async (choice: MathChoice) => {
    setGenerating(true);
    try {
      await api.post<MathCardDto>('/child/math-cards/generate', { choice });
      setResult(null);
      await load();
      onDone?.();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setGenerating(false);
    }
  };

  const act = async (card: MathCardDto, action: 'request' | 'revoke' | 'start') => {
    setBusy(true);
    try {
      await api.post(`/child/math-cards/${card.id}/${action}`);
      setResult(null);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (card: MathCardDto) => {
    setBusy(true);
    try {
      const list = card.tasks.map((t) => answers[t.id] ?? '');
      const res = await api.post<MathCardSubmitResult>(`/child/math-cards/${card.id}/submit`, { answers: list });
      setResult(res);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const remaining = (card: MathCardDto) => {
    if (!card.deadline) return 0;
    return Math.max(0, Math.floor((new Date(card.deadline).getTime() - Date.now()) / 1000));
  };

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (day === null) return <Spinner label="Загружаем карточки…" />;

  const cards = day.cards;
  const doneToday = day.doneToday;
  const dailyLimit = day.dailyLimit;
  const active = cards.find((c) => c.status === 'IN_PROGRESS');
  const limitReached = doneToday >= dailyLimit;
  const visible = active ? [active] : cards;

  return (
    <div className="space-y-3">
      {limitReached && !active && (
        <div className="rpg-panel p-3 text-sm text-stone-400">
          Лимит на сегодня исчерпан — новые карточки появятся завтра в 9:00
        </div>
      )}

      {/* Выбор уровня — пока не решены все 3 карточки дня и нет активной */}
      {!active && !limitReached && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CHOICES.map((c) => (
            <button
              key={c.choice}
              disabled={generating || busy}
              onClick={() => void generate(c.choice)}
              className={`rpg-panel p-3 text-left transition hover:border-amber-600/60 ${generating ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-100">
                  {c.emoji} {c.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-stone-400">
                  <Clock3 size={13} /> {c.minutes} мин
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {visible.map((card) => {
        const inProgress = card.status === 'IN_PROGRESS';
        const overdue = inProgress && remaining(card) <= 0;
        return (
          <div key={card.id} className={`rpg-panel p-4 ${overdue ? 'border-rose-700/60' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-bold text-amber-100">
                  <span className="text-lg">{card.levelEmoji}</span> Карточка · {card.levelLabel}
                  {card.resultPercent != null && (
                    <span
                      className={`rpg-badge border ${
                        card.status === 'SUCCESS' ? 'border-emerald-500/40 text-emerald-300' : 'border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {card.status === 'SUCCESS' ? '✅ Успешно' : '❌ Не выполнено'} · {card.resultPercent}%
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-stone-300">{card.description}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-300">
                  <span className="rpg-badge border border-stone-600/40 bg-stone-600/15 text-stone-300">
                    {card.taskCount} задач
                  </span>
                  <span className="rpg-badge border border-amber-500/40 bg-amber-500/15 text-amber-300">
                    <Clock3 size={11} /> {card.minutes} мин
                  </span>
                  <span className="rpg-badge border border-sky-500/40 bg-sky-500/15 text-sky-300">
                    ⚡ +{card.xpReward} XP за успех
                  </span>
                  <span className="rpg-badge border border-amber-600/40 bg-amber-600/15 text-amber-300">
                    🪙 до {card.maxMatrixReward} Матрикс за карточку
                  </span>
                  {card.taskTypes.map((t) => (
                    <span key={t} className="rpg-badge border border-stone-700/40 bg-stone-700/15 text-stone-400">
                      {TYPE_LABELS[t] ?? t}
                    </span>
                  ))}
                </div>
                {inProgress && (
                  <div
                    className={`mt-2 flex items-center gap-2 text-lg font-extrabold ${overdue ? 'text-rose-400' : 'text-amber-200'}`}
                  >
                    <Clock3 size={18} /> {overdue ? 'Время вышло' : fmt(remaining(card))}
                  </div>
                )}
                {card.status === 'SUCCESS' && card.xpEarned > 0 && (
                  <div className="mt-1.5 text-sm font-bold text-emerald-300">
                    ⚡ +{card.xpEarned} XP · 🪙 +{card.xpEarned} Матрикс в навык «Математика»
                  </div>
                )}
                {card.status === 'FAILED' && card.xpEarned > 0 && (
                  <div className="mt-1.5 text-sm font-bold text-amber-300">
                    ⚡ +{card.xpEarned} XP · 🪙 +{card.xpEarned} Матрикс за верные примеры
                  </div>
                )}
              </div>

              {card.status === 'CREATED' && (
                <button className="rpg-btn" disabled={busy} onClick={() => void act(card, 'request')}>
                  🎯 Взять задачу
                </button>
              )}
              {card.status === 'REQUESTED' && (
                <button className="rpg-btn rpg-btn-ghost" disabled={busy} onClick={() => void act(card, 'revoke')}>
                  ⏳ Ожидает одобрения (отозвать)
                </button>
              )}
              {card.status === 'APPROVED' && (
                <button className="rpg-btn" disabled={busy} onClick={() => void act(card, 'start')}>
                  ▶ Начать задачу
                </button>
              )}
            </div>

            {inProgress && !overdue && (
              <div className="mt-3 space-y-2 rounded-xl bg-stone-900/60 p-3">
                {card.tasks.map((t, i) => (
                  <div key={t.id} className="flex flex-wrap items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-700/60 text-xs font-bold text-amber-200">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-stone-200">{t.text}</span>
                    <input
                      className="input !w-36 text-right"
                      placeholder="Ответ"
                      value={answers[t.id] ?? ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [t.id]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-1">
                  <button className="rpg-btn" disabled={busy} onClick={() => void submit(card)}>
                    <Send size={15} /> Отправить на проверку
                  </button>
                </div>
                {result && (
                  <div
                    className={`rounded-xl px-3 py-2 text-sm font-bold ${
                      result.success ? 'bg-emerald-900/40 text-emerald-300' : 'bg-rose-900/40 text-rose-300'
                    }`}
                  >
                    {result.success ? <Check size={15} /> : <X size={15} />} Верно {result.correct} из {result.total} ·{' '}
                    {result.percent}% · ⚡ +{result.xpEarned} XP
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}