import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clock3, RefreshCw, X } from 'lucide-react';
import { api } from '../../../../api/client';
import { MathCardAnswerResult, MathCardDto, MathChoice } from '../../../../api/types';
import { errMsg } from '../../../../lib/format';
import { Spinner } from '../../../ui';

const CHOICES: Array<{ choice: MathChoice; label: string; emoji: string; minutes: number; hint: string }> = [
  { choice: 'EASY', label: 'Легкая', emoji: '🟢', minutes: 30, hint: 'Самый простой уровень' },
  { choice: 'MEDIUM', label: 'Обычная', emoji: '⚪', minutes: 35, hint: 'Базовый уровень' },
  { choice: 'HIGH', label: 'Высокая', emoji: '🔵', minutes: 40, hint: 'Повышенный уровень' },
  { choice: 'HARD', label: 'Сложная', emoji: '🟣', minutes: 45, hint: '+1 ступень к базовому' },
  { choice: 'EXTREME', label: 'Хард', emoji: '🔴', minutes: 50, hint: 'Только по желанию ребёнка' },
  { choice: 'OLYMPIAD', label: 'Олимпиада', emoji: '🟠', minutes: 60, hint: 'Статичные олимпиадные шаблоны' },
];

const TYPE_LABELS: Record<string, string> = {
  CALC: '🔢 Примеры на вычисление',
  EQUATION: '⚖️ Уравнения',
  TEXT: '📝 Текстовые задачи',
};

/**
 * Динамическая математическая карточка (ребёнок): выбор уровня —
 * «Легкая/Обычная/Высокая/Сложная/Хард/Олимпиада», генерация на день,
 * метаданные (описание, число задач, типы, таймер) и проверка ответов.
 */
export default function MathCardView({ onDone }: { onDone?: () => void }) {
  const [card, setCard] = useState<MathCardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, MathCardAnswerResult>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const today = await api.get<MathCardDto | null>('/child/math-cards/today');
      setCard(today);
      if (today) {
        setSecondsLeft(today.minutes * 60);
      }
      setResults({});
      setAnswers({});
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  useEffect(() => {
    if (secondsLeft == null) return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s == null || s <= 1) {
          if (timerRef.current != null) window.clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
    };
  }, [secondsLeft != null]);

  const generate = async (choice: MathChoice) => {
    setGenerating(true);
    try {
      const c = await api.post<MathCardDto>('/child/math-cards/generate', { choice });
      setCard(c);
      setSecondsLeft(c.minutes * 60);
      setResults({});
      setAnswers({});
      onDone?.();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setGenerating(false);
    }
  };

  const check = async (taskId: number) => {
    try {
      const res = await api.post<MathCardAnswerResult>(`/child/math-cards/tasks/${taskId}/answer`, {
        answer: answers[taskId] ?? '',
      });
      setResults((prev) => ({ ...prev, [taskId]: res }));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <Spinner label="Загружаем карточку дня…" />;

  if (!card) {
    return (
      <div className="space-y-3">
        <div className="rpg-panel rpg-panel-gold p-4">
          <div className="rpg-title text-lg">🧮 Карточка дня по математике</div>
          <p className="text-sm text-stone-400">
            Выбери уровень — карточка сгенерируется из тем, которые настроили родители.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CHOICES.map((c) => (
            <button
              key={c.choice}
              disabled={generating}
              onClick={() => generate(c.choice)}
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
              <div className="mt-1 text-xs text-stone-400">{c.hint}</div>
            </button>
          ))}
        </div>
        <button className="rpg-btn rpg-btn-ghost text-xs" onClick={() => void loadToday()}>
          <RefreshCw size={14} /> Обновить
        </button>
      </div>
    );
  }

  const expired = secondsLeft === 0;

  return (
    <div className="space-y-3">
      <div className="rpg-panel rpg-panel-gold p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="rpg-title text-lg">
              {card.levelEmoji} Карточка · {card.levelLabel}
            </div>
            <div className="mt-1 text-sm text-stone-300">{card.description}</div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-lg font-extrabold ${
              expired ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/40 text-amber-200'
            }`}
          >
            <Clock3 size={18} /> {fmt(secondsLeft ?? card.minutes * 60)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-300">
          <span className="badge bg-amber-500/15 text-amber-200">{card.taskCount} задач</span>
          {card.taskTypes.map((t) => (
            <span key={t} className="badge bg-stone-700/50 text-stone-300">
              {TYPE_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      </div>

      {expired && <div className="rpg-panel p-3 text-sm text-rose-300">⏰ Время вышло!</div>}

      <div className="space-y-2">
        {card.tasks.map((t, i) => {
          const res = results[t.id];
          return (
            <div key={t.id} className="rpg-panel flex flex-wrap items-center gap-3 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-700/60 text-xs font-bold text-amber-200">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 text-sm text-stone-200">{t.text}</div>
              <input
                className="input !w-32 text-right"
                placeholder="Ответ"
                value={answers[t.id] ?? ''}
                disabled={res != null}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [t.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && res == null && void check(t.id)}
              />
              <button
                className="rpg-btn rpg-btn-ghost !px-2.5 !py-1.5 text-xs"
                disabled={res != null}
                onClick={() => void check(t.id)}
              >
                {res ? (
                  res.correct ? (
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Check size={14} /> Верно
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-300">
                      <X size={14} /> {res.expected}
                    </span>
                  )
                ) : (
                  'Проверить'
                )}
              </button>
            </div>
          );
        })}
      </div>

      <button
        className="rpg-btn rpg-btn-ghost text-xs"
        onClick={() => {
          setCard(null);
          setSecondsLeft(null);
        }}
      >
        <RefreshCw size={14} /> Выбрать другой уровень
      </button>
    </div>
  );
}