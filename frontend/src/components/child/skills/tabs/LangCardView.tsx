import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, Clock3, Send, X } from 'lucide-react';
import { api } from '../../../../api/client';
import {
  LangCardDayDto,
  LangCardDto,
  LangCardSubmitResult,
  LangTaskType,
  LangVocabWord,
} from '../../../../api/types';
import { errMsg } from '../../../../lib/format';
import LangManuscript from './LangManuscript';
import { Spinner } from '../../../ui';

/**
 * Динамические карточки иностранного языка (ребёнок). До 3 карточек в день (сброс в 9:00).
 * 6 видов заданий вместо уровней сложности. Авто-задания проверяются автоматически,
 * ручные (Расшифруй послание, Поделись секретом, Покажи своё мастерство) уходят родителю.
 * Плюс вкладки: Словарь (изучил/изучает) и Манускрипт (учебник A1–B2).
 */
export default function LangCardView({ onDone }: { onDone?: () => void }) {
  const [tab, setTab] = useState<'cards' | 'vocab' | 'manuscript'>('cards');
  const [day, setDay] = useState<LangCardDayDto | null>(null);
  const [vocab, setVocab] = useState<LangVocabWord[]>([]);
  const [busy, setBusy] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answersRu, setAnswersRu] = useState<Record<number, string>>({});
  const [result, setResult] = useState<LangCardSubmitResult | null>(null);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const [d, v] = await Promise.all([
        api.get<LangCardDayDto>('/child/lang-cards'),
        api.get<LangVocabWord[]>('/child/lang-vocab'),
      ]);
      setDay(d);
      setVocab(v);
    } catch (e) {
      alert(errMsg(e));
      setDay({ cards: [], doneToday: 0, dailyLimit: 3 });
      setVocab([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const generate = async (taskType: LangTaskType) => {
    setBusy(true);
    try {
      await api.post<LangCardDto>('/child/lang-cards/generate', { taskType });
      setResult(null);
      setAnswers({});
      setAnswersRu({});
      await load();
      onDone?.();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const start = async (card: LangCardDto) => {
    setBusy(true);
    try {
      await api.post(`/child/lang-cards/${card.id}/start`);
      setResult(null);
      setAnswers({});
      setAnswersRu({});
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (card: LangCardDto) => {
    setBusy(true);
    try {
      const list = card.tasks.map((t) =>
        t.taskType === 'SECRET_STORIES' ? `${answers[t.id] ?? ''}|${answersRu[t.id] ?? ''}` : answers[t.id] ?? '',
      );
      const res = await api.post<LangCardSubmitResult>(`/child/lang-cards/${card.id}/submit`, { answers: list });
      setResult(res);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const remaining = (card: LangCardDto) => {
    if (!card.deadline) return 0;
    return Math.max(0, Math.floor((new Date(card.deadline).getTime() - Date.now()) / 1000));
  };

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (day === null) return <Spinner label="Загружаем карточки…" />;

  const active = day.cards.find((c) => c.status === 'IN_PROGRESS');
  const limitReached = day.doneToday >= day.dailyLimit;
  const visible = active ? [active] : day.cards;
  const learning = vocab.filter((w) => w.status === 'ACTIVE');
  const learned = vocab.filter((w) => w.status === 'LEARNED');

  return (
    <div className="space-y-3">
      {/* Вкладки: карточки / словарь / манускрипт */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([
          { id: 'cards', label: '🎴 Карточки' },
          { id: 'vocab', label: `📖 Словарь (${learning.length}/${learned.length})` },
          { id: 'manuscript', label: '📜 Манускрипт' },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`rpg-tab ${tab === t.id ? 'rpg-tab-active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'manuscript' && <LangManuscript />}

      {tab === 'vocab' && (
        <div className="space-y-3">
          {learning.length > 0 && (
            <div className="rpg-panel p-3">
              <div className="mb-2 text-sm font-bold text-amber-100">🧠 Изучаю ({learning.length}/50)</div>
              <div className="space-y-1.5">
                {learning.map((w) => (
                  <div key={w.wordId} className="flex items-center justify-between gap-2 rounded-lg bg-stone-900/60 px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="font-bold text-sky-300">{w.foreign}</span>
                      <span className="mx-2 text-stone-500">—</span>
                      <span className="text-stone-300">{w.ru}</span>
                    </span>
                    <span className="shrink-0 text-xs text-stone-400">
                      серия {w.streak}/{w.streakTarget}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rpg-panel p-3">
            <div className="mb-2 text-sm font-bold text-emerald-300">✅ Изучил ({learned.length})</div>
            {learned.length === 0 ? (
              <div className="text-sm text-stone-400">Пока ничего не изучено — реши 50 задач со словом подряд без ошибок</div>
            ) : (
              <div className="space-y-1.5">
                {learned.map((w) => (
                  <div key={w.wordId} className="rounded-lg bg-stone-900/60 px-3 py-2 text-sm">
                    <span className="font-bold text-emerald-300">{w.foreign}</span>
                    <span className="mx-2 text-stone-500">—</span>
                    <span className="text-stone-300">{w.ru}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'cards' && (
        <>
          {limitReached && !active && (
            <div className="rpg-panel p-3 text-sm text-stone-400">
              Лимит на сегодня исчерпан — новые карточки появятся завтра в 9:00
            </div>
          )}

          {/* Выбор вида задания — пока нет активной карточки и не исчерпан лимит */}
          {!active && !limitReached && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ['WORD_WALL', '🧱', 'Перевод слов en → ru'],
                  ['SECRET_STORIES', '📜', 'Пропуски в историях'],
                  ['DECODE', '🔐', 'Перевод текста (родителю)'],
                  ['SPELLING', '✏️', 'Написание ru → en'],
                  ['SHARE_SECRET', '🤫', 'Вопрос ru → ответ en (родителю)'],
                  ['MASTERY', '🏆', 'Вопрос en → ответ en (родителю)'],
                ] as Array<[LangTaskType, string, string]>
              ).map(([type, emoji, hint]) => (
                <button
                  key={type}
                  disabled={busy}
                  onClick={() => void generate(type)}
                  className="rpg-panel p-3 text-left transition hover:border-amber-600/60"
                >
                  <div className="font-bold text-amber-100">{emoji} {LANG_TYPE_LABELS[type]}</div>
                  <div className="mt-1 text-xs text-stone-400">{hint}</div>
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
                      <span className="text-lg">{card.taskTypeEmoji}</span> {card.taskTypeLabel}
                      <span className="rpg-badge border border-stone-600/40 bg-stone-600/15 text-stone-300">
                        {card.difficultyLabel}
                      </span>
                      {card.resultPercent != null && (
                        <span
                          className={`rpg-badge border ${
                            card.status === 'SUCCESS' ? 'border-emerald-500/40 text-emerald-300' : 'border-rose-500/40 text-rose-300'
                          }`}
                        >
                          {card.status === 'SUCCESS' ? '✅ Зачтено' : '❌ Не зачтено'}
                          {card.multiplier > 0 && ` · ×${card.multiplier}`}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-300">
                      <span className="rpg-badge border border-amber-500/40 bg-amber-500/15 text-amber-300">
                        <Clock3 size={11} /> {card.minutes} мин
                      </span>
                      <span className="rpg-badge border border-sky-500/40 bg-sky-500/15 text-sky-300">
                        ⚡ до {card.maxReward} XP
                      </span>
                      {card.manual && (
                        <span className="rpg-badge border border-violet-500/40 bg-violet-500/15 text-violet-300">
                          🔍 Проверка родителем ×0/×1/×2
                        </span>
                      )}
                    </div>
                    {inProgress && (
                      <div
                        className={`mt-2 flex items-center gap-2 text-lg font-extrabold ${overdue ? 'text-rose-400' : 'text-amber-200'}`}
                      >
                        <Clock3 size={18} /> {overdue ? 'Время вышло' : fmt(remaining(card))}
                      </div>
                    )}
                    {card.status === 'REVIEW' && (
                      <div className="mt-1.5 text-sm font-bold text-violet-300">
                        ⏳ Отправлено родителю на проверку
                      </div>
                    )}
                    {card.status === 'SUCCESS' && card.xpEarned > 0 && (
                      <div className="mt-1.5 text-sm font-bold text-emerald-300">⚡ +{card.xpEarned} XP · 🌍 лингво-мили</div>
                    )}
                    {card.parentComment && (
                      <div className="mt-1 text-sm text-stone-400">Родитель: {card.parentComment}</div>
                    )}
                  </div>

                  {card.status === 'CREATED' && (
                    <button className="rpg-btn" disabled={busy} onClick={() => void start(card)}>
                      ▶ Начать
                    </button>
                  )}
                </div>

                {inProgress && !overdue && (
                  <div className="mt-3 space-y-2 rounded-xl bg-stone-900/60 p-3">
                    {card.tasks.map((t, i) => (
                      <div key={t.id} className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-700/60 text-xs font-bold text-amber-200">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1 whitespace-pre-line text-sm text-stone-200">{t.text}</span>
                        </div>
                        {t.taskType === 'SECRET_STORIES' ? (
                          <div className="flex flex-wrap gap-2 pl-9">
                            <input
                              className="input !w-40"
                              placeholder="По-английски"
                              value={answers[t.id] ?? ''}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [t.id]: e.target.value }))}
                            />
                            <input
                              className="input !w-40"
                              placeholder="По-русски"
                              value={answersRu[t.id] ?? ''}
                              onChange={(e) => setAnswersRu((prev) => ({ ...prev, [t.id]: e.target.value }))}
                            />
                          </div>
                        ) : (
                          <div className="pl-9">
                            <textarea
                              className="input min-h-16 w-full"
                              placeholder="Твой ответ"
                              value={answers[t.id] ?? ''}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [t.id]: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end pt-1">
                      <button className="rpg-btn" disabled={busy} onClick={() => void submit(card)}>
                        <Send size={15} /> {card.manual ? 'Отправить родителю' : 'Отправить на проверку'}
                      </button>
                    </div>
                    {result && !result.sentToParent && (
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
        </>
      )}
    </div>
  );
}

const LANG_TYPE_LABELS: Record<LangTaskType, string> = {
  WORD_WALL: 'Стена слов',
  SECRET_STORIES: 'Тайные истории',
  DECODE: 'Расшифруй послание',
  SPELLING: 'А оно точно так пишется',
  SHARE_SECRET: 'Поделись секретом',
  MASTERY: 'Покажи своё мастерство',
};

// BookOpen импортирован для потенциальных расширений вкладки словаря
void BookOpen;
