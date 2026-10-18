import { useCallback, useEffect, useRef, useState } from 'react';
import { HandCoins, Pause, Play, Snowflake } from 'lucide-react';
import { api } from '../../api/client';
import { LimitStateDto, LimitTypeState } from '../../api/types';
import { errMsg } from '../../lib/format';
import { Spinner } from '../ui';

const LIMIT_META: Record<string, { label: string; emoji: string }> = {
  TV: { label: 'Телевизор', emoji: '📺' },
  PC: { label: 'Компьютер', emoji: '💻' },
  CONSOLE: { label: 'Приставка', emoji: '🎮' },
  PHONE: { label: 'Телефон', emoji: '📱' },
  TABLET: { label: 'Планшет', emoji: '📟' },
};

function fmtDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

/**
 * Панель лимитов дня: полоски (ТВ, ПК, приставка, телефон, планшет) с кнопкой
 * play/pause (счётчик тикает локально и синхронизируется с бэкендом) +
 * карманные деньги (₽/неделю) с запросом выдачи родителю.
 */
export default function LimitsPanel() {
  const [state, setState] = useState<LimitStateDto | null>(null);
  const [pocketAmount, setPocketAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const tickRef = useRef<number | null>(null);
  /** Типы, для которых уже отправлен серверный stop при исчерпании лимита. */
  const stopRef = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const next = await api.get<LimitStateDto>('/child/limits');
      stopRef.current = new Set();
      setState(next);
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runningKey = state?.limits.map((l) => (l.running ? '1' : '0')).join('') ?? '';

  // Локальный тикер: полоска уменьшается каждую секунду, пока счётчик запущен.
  useEffect(() => {
    if (!runningKey.includes('1')) return;
    tickRef.current = window.setInterval(() => {
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          limits: prev.limits.map((l) => {
            if (!l.running || l.frozen) return l;
            const rem = Math.max(0, l.remainingSeconds - 1);
            // Лимит исчерпан: останавливаем счётчик и уведомляем сервер (родителю придёт LIMIT-уведомление)
            if (rem === 0) {
              if (!stopRef.current.has(l.type)) {
                stopRef.current.add(l.type);
                void api.post(`/child/limits/${l.type}/stop`).catch(() => {});
              }
              return { ...l, remainingSeconds: 0, running: false };
            }
            return { ...l, remainingSeconds: rem };
          }),
        };
      });
    }, 1000);
    return () => {
      if (tickRef.current != null) window.clearInterval(tickRef.current);
    };
  }, [runningKey]);

  const toggle = async (limit: LimitTypeState) => {
    setBusy(true);
    try {
      await api.post(`/child/limits/${limit.type}/${limit.running ? 'stop' : 'start'}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const requestPocket = async (amount: number) => {
    if (!amount || amount <= 0) {
      alert('Укажите сумму в рублях');
      return;
    }
    setBusy(true);
    try {
      await api.post('/child/pocket/request', { amount });
      setPocketAmount('');
      alert('Запрос отправлен родителю');
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (!state) return <Spinner label="Загружаем лимиты…" />;

  const maxSeconds = (l: LimitTypeState) => Math.max(1, l.baseMinutes * 60 + l.extendedSeconds);
  const percent = (l: LimitTypeState) => Math.min(100, Math.round((l.remainingSeconds / maxSeconds(l)) * 100));

  return (
    <div className="space-y-3">
      {state.limits.map((l) => {
        const meta = LIMIT_META[l.type] ?? { label: l.type, emoji: '⏱' };
        return (
          <div key={l.type} className="flex items-center gap-2">
            <span className="w-6 text-center text-lg">{meta.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className={`font-semibold ${l.frozen ? 'text-sky-300' : 'text-amber-100'}`}>
                  {meta.label}
                  {l.frozen && <span className="ml-1 text-sky-300">❄️ заморожен</span>}
                </span>
                <span className="text-amber-200/70">{fmtDuration(l.remainingSeconds)}</span>
              </div>
              <div className="rpg-progress-track h-2.5">
                <div
                  className={l.frozen ? 'rpg-progress-fill !bg-gradient-to-r !from-sky-400 !to-cyan-300' : 'rpg-progress-fill'}
                  style={{ width: `${percent(l)}%` }}
                />
              </div>
            </div>
            <button
              className={`rounded-lg p-1.5 transition ${
                l.frozen
                  ? 'cursor-not-allowed bg-sky-500/20 text-sky-300'
                  : l.running
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
              }`}
              disabled={busy || l.frozen}
              onClick={() => void toggle(l)}
              title={l.frozen ? 'Лимит заморожен родителем' : l.running ? 'Пауза' : 'Включить счётчик'}
            >
              {l.frozen ? <Snowflake size={14} /> : l.running ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        );
      })}

      {/* Карманные деньги */}
      <div className="flex items-center gap-2 border-t border-amber-500/20 pt-2">
        <span className="w-6 text-center text-lg">💰</span>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-100">Карманные деньги</span>
            <span className="text-amber-200/70">
              {state.pocket.remaining} ₽ / {state.pocket.weeklyLimit} ₽
            </span>
          </div>
          <div className="rpg-progress-track h-2.5">
            <div
              className="rpg-progress-fill !bg-gradient-to-r !from-emerald-500 !to-teal-400"
              style={{
                width: `${
                  state.pocket.weeklyLimit > 0
                    ? Math.min(100, Math.round((state.pocket.remaining / state.pocket.weeklyLimit) * 100))
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
        <button
          className="rounded-lg bg-amber-500/20 p-1.5 text-amber-300 transition hover:bg-amber-500/30"
          disabled={busy}
          onClick={() => void requestPocket(Number(pocketAmount))}
          title="Попросить карманные деньги"
        >
          <HandCoins size={14} />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          className="rpg-input w-full"
          type="number"
          min="1"
          placeholder="Сумма в ₽"
          value={pocketAmount}
          onChange={(e) => setPocketAmount(e.target.value)}
        />
        <button
          className="rpg-btn !px-3 !py-1.5 text-xs"
          disabled={busy || !pocketAmount.trim()}
          onClick={() => void requestPocket(Number(pocketAmount))}
        >
          Запросить
        </button>
      </div>
    </div>
  );
}