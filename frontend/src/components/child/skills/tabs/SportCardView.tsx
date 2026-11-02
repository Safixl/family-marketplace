import { useCallback, useEffect, useState } from 'react';
import { Check, Send, X } from 'lucide-react';
import { api } from '../../../../api/client';
import { SportCardDto, SportDayDto, SportRequestDto } from '../../../../api/types';
import { errMsg } from '../../../../lib/format';
import { Spinner } from '../../../ui';

/**
 * Дейлик навыка «Спорт и хобби»: ребёнок выбирает направление (Физкультура — по умолчанию,
 * или увлечения, созданные родителем), получает карточку из случайных заданий, выполняет
 * оффлайн и отправляет родителю. 1 дейлик в день, проверяет родитель ×0/×1/×2.
 * Кнопка «Хочу новое направление» — запрос родителю на добавление увлечения (до 6 всего).
 */
export default function SportCardView({ onDone }: { onDone?: () => void }) {
  const [day, setDay] = useState<SportDayDto | null>(null);
  const [requests, setRequests] = useState<SportRequestDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqComment, setReqComment] = useState('');

  const load = useCallback(async () => {
    // Направления и запросы грузим независимо: ошибка истории запросов
    // не должна прятать дейлик по физкультуре
    try {
      setDay(await api.get<SportDayDto>('/child/sport-day'));
    } catch (e) {
      alert(errMsg(e));
      setDay({ directions: [], card: null });
    }
    try {
      setRequests(await api.get<SportRequestDto[]>('/child/sport-requests'));
    } catch {
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const generate = async (directionId: number) => {
    setBusy(true);
    try {
      await api.post<SportCardDto>('/child/sport-cards/generate', { directionId });
      await load();
      onDone?.();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (card: SportCardDto) => {
    setBusy(true);
    try {
      await api.post<SportCardDto>(`/child/sport-cards/${card.id}/submit`);
      await load();
      onDone?.();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const sendRequest = async () => {
    setBusy(true);
    try {
      await api.post('/child/sport-requests', { name: reqName, comment: reqComment });
      setShowRequest(false);
      setReqName('');
      setReqComment('');
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (day === null) return <Spinner label="Загружаем направления…" />;

  const card = day.card;
  const pending = requests.filter((r) => r.status === 'PENDING');
  const rejectedOrResolved = requests.filter((r) => r.status !== 'PENDING').slice(0, 5);

  return (
    <div className="space-y-3">
      {/* Карточка дня (если выбрано направление) */}
      {card && (
        <div className="rpg-panel p-4">
          <div className="flex flex-wrap items-center gap-2 font-bold text-amber-100">
            <span className="text-lg">{card.directionIcon}</span> {card.directionName} · дейлик дня
            {card.status === 'REVIEW' && (
              <span className="rpg-badge border border-violet-500/40 bg-violet-500/15 text-violet-300">
                ⏳ Отправлено родителю
              </span>
            )}
            {card.status === 'SUCCESS' && (
              <span className="rpg-badge border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
                ✅ Зачтено{card.multiplier > 0 && ` · ×${card.multiplier}`}
              </span>
            )}
            {card.status === 'FAILED' && (
              <span className="rpg-badge border border-rose-500/40 bg-rose-500/15 text-rose-300">❌ Не зачтено</span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-300">
            <span className="rpg-badge border border-sky-500/40 bg-sky-500/15 text-sky-300">
              ⚡ до {card.maxReward} XP
            </span>
            <span className="rpg-badge border border-violet-500/40 bg-violet-500/15 text-violet-300">
              🔍 Проверка родителем ×0/×1/×2
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {card.taskTitles.map((t, i) => (
              <div key={i} className="rounded-xl bg-stone-900/60 p-3">
                <div className="flex items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-700/60 text-xs font-bold text-amber-200">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-stone-200">{t}</div>
                    {card.taskDescriptions[i] && (
                      <div className="mt-0.5 text-xs text-stone-400">{card.taskDescriptions[i]}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {card.status === 'CREATED' && (
            <div className="mt-3 flex justify-end">
              <button className="rpg-btn" disabled={busy} onClick={() => void submit(card)}>
                <Send size={15} /> Выполнено — отправить родителю
              </button>
            </div>
          )}
          {card.status === 'SUCCESS' && card.xpEarned > 0 && (
            <div className="mt-2 text-sm font-bold text-emerald-300">⚡ +{card.xpEarned} XP · ⚽ очки спорта</div>
          )}
          {card.parentComment && (
            <div className="mt-2 text-sm text-stone-400">Родитель: {card.parentComment}</div>
          )}
        </div>
      )}

      {/* Выбор направления — если дейлик ещё не сделан */}
      {!card && (
        <>
          <div className="text-sm font-bold text-amber-100">Выбери направление для сегодняшнего дейлика:</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {day.directions.map((d) => (
              <button
                key={d.id}
                disabled={busy}
                onClick={() => void generate(d.id)}
                className="rpg-panel p-3 text-left transition hover:border-amber-600/60"
              >
                <span className="text-xl">{d.icon}</span>
                <div className="mt-1 font-bold text-amber-100">{d.name}</div>
              </button>
            ))}
            <button
              disabled={busy}
              onClick={() => setShowRequest(true)}
              className="rpg-panel p-3 text-left transition hover:border-violet-500/60 opacity-80"
            >
              <span className="text-xl">➕</span>
              <div className="mt-1 font-bold text-violet-300">Хочу новое направление</div>
              <div className="mt-1 text-xs text-stone-400">Предложить родителю увлечение</div>
            </button>
          </div>
        </>
      )}

      {/* Форма запроса нового направления */}
      {showRequest && (
        <div className="rpg-panel space-y-2 p-4">
          <div className="font-bold text-amber-100">➕ Запрос нового направления</div>
          <input
            className="input w-full"
            placeholder="Например: Каратэ, Шахматы, Рисование…"
            value={reqName}
            onChange={(e) => setReqName(e.target.value)}
          />
          <textarea
            className="input min-h-16 w-full"
            placeholder="Расскажи, почему тебе это интересно (необязательно)"
            value={reqComment}
            onChange={(e) => setReqComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button className="rpg-btn rpg-btn-ghost" disabled={busy} onClick={() => setShowRequest(false)}>
              Отмена
            </button>
            <button className="rpg-btn" disabled={busy || !reqName.trim()} onClick={() => void sendRequest()}>
              <Send size={15} /> Отправить родителю
            </button>
          </div>
        </div>
      )}

      {/* Мои запросы */}
      {requests.length > 0 && (
        <div className="rpg-panel p-3">
          <div className="mb-2 text-sm font-bold text-stone-300">Мои запросы</div>
          <div className="space-y-1.5">
            {pending.map((r) => (
              <div key={r.requestId} className="flex items-center justify-between gap-2 rounded-lg bg-stone-900/60 px-3 py-2 text-sm">
                <span className="text-stone-200">➕ {r.name}</span>
                <span className="text-xs text-amber-300">⏳ Ждёт родителя</span>
              </div>
            ))}
            {rejectedOrResolved.map((r) => (
              <div key={r.requestId} className="flex items-center justify-between gap-2 rounded-lg bg-stone-900/60 px-3 py-2 text-sm">
                <span className="text-stone-400">➕ {r.name}</span>
                {r.status === 'RESOLVED' ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-300">
                    <Check size={13} /> Создано!
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-rose-300">
                    <X size={13} /> Отклонено
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
