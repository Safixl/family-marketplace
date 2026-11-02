import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BedDouble, Dices, Lock, ScrollText, Swords } from 'lucide-react';
import { api } from '../../../api/client';
import { DungeonStateDto } from '../../../api/types';
import { errMsg } from '../../../lib/format';
import { Spinner } from '../../ui';

const CLASS_META: Record<string, { label: string; emoji: string; hint: string }> = {
  WARRIOR: { label: 'Воин', emoji: '⚔️', hint: 'Мощь в открытом бою (+15% к атаке)' },
  MAGE: { label: 'Маг', emoji: '🪄', hint: 'Острый ум: +5% к проверкам Логики и Языка' },
  ARCHER: { label: 'Лучник', emoji: '🏹', hint: 'Меткость и скорость (+10% к атаке)' },
};

/** Цветовые маркеры рангов подземелий: F серый → S золотой. */
export const RANK_STYLE: Record<string, string> = {
  F: 'border-stone-500/50 bg-stone-500/20 text-stone-300',
  D: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300',
  C: 'border-sky-500/50 bg-sky-500/20 text-sky-300',
  B: 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300',
  A: 'border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-300',
  S: 'border-amber-400/60 bg-amber-400/20 text-amber-300',
};

const RANK_SPIN = ['F', 'D', 'C', 'B', 'A', 'S'];
const SPIN_EMOJI = ['💀', '👺', '🕷️', '📖', '🌊', '🐉', '💎', '⚒️'];

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function fmtCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60000));
  const m = total % 60;
  return `${total > 0 ? `${total} мин ` : ''}${m} с`;
}

/**
 * Виджет «Журнал Приключений»: таверна, выбор данжа и текстовая трансляция
 * похода героя (лог постепенно «оживает» по мере наступления времени событий).
 */
export default function AdventureLog() {
  const [state, setState] = useState<DungeonStateDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [rolling, setRolling] = useState(false);
  const [rollRank, setRollRank] = useState('F');
  const [rollEmoji, setRollEmoji] = useState('💀');
  const logRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setState(await api.get<DungeonStateDto>('/child/dungeon'));
    } catch {
      setState(null);
    }
  }, []);

  const session = state?.session ?? null;
  const liveSession = session != null && (session.status === 'ACTIVE' || session.status === 'RESTING');

  useEffect(() => {
    void load();
  }, [load]);

  // Опрос состояния, пока герой в походе (там таймлайн догоняет реальное время)
  useEffect(() => {
    if (!liveSession) return;
    const id = window.setInterval(() => void load(), 20000);
    return () => window.clearInterval(id);
  }, [liveSession, load]);

  // Тикер для плавного проявления новых записей лога
  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [session]);

  const visibleLogs = useMemo(() => {
    if (!session) return [];
    return session.logs.filter((e) => new Date(e.at).getTime() <= now);
  }, [session, now]);

  /** Таймлайн доиграл до конца: только тогда показываем итог похода. */
  const revealed = session ? visibleLogs.length >= session.logs.length : true;

  /** Текущая комната по последней «проявленной» записи (не спойлерим финал). */
  const revealedRoom = useMemo(() => {
    if (!session) return 1;
    if (revealed) return session.currentRoom;
    for (let i = visibleLogs.length - 1; i >= 0; i--) {
      const m = visibleLogs[i].text.match(/Комнат[аыу]\s+(\d+)/);
      if (m) return Number(m[1]);
    }
    return 1;
  }, [session, revealed, visibleLogs]);

  const nextEntry = useMemo(() => {
    if (!session || session.status !== 'ACTIVE') return null;
    return session.logs.find((e) => new Date(e.at).getTime() > now) ?? null;
  }, [session, now]);

  // Автоскролл лога вниз при появлении новых записей
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [visibleLogs.length]);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  /** Рулетка таверны: анимация прокрутки рангов → генерация квеста на бэкенде. */
  const rollQuest = async () => {
    setRolling(true);
    const spin = window.setInterval(() => {
      setRollRank(RANK_SPIN[Math.floor(Math.random() * RANK_SPIN.length)]);
      setRollEmoji(SPIN_EMOJI[Math.floor(Math.random() * SPIN_EMOJI.length)]);
    }, 120);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      await api.post('/child/dungeon/start', {});
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      window.clearInterval(spin);
      setRolling(false);
    }
  };

  if (!state) {
    return <Spinner label="Открываем журнал приключений…" />;
  }

  const { character, unlock } = state;
  const staminaPercent = Math.min(100, Math.round((character.stamina / character.maxStamina) * 100));

  // ---------- Таверна закрыта: режим обучения ----------
  if (character.status === 'LOCKED' || !unlock.unlocked) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4">
        <div className="mb-3 flex items-center gap-2 font-bold text-amber-200">
          <Lock size={16} /> Таверна закрыта
        </div>
        <p className="mb-3 text-sm text-stone-400">
          Герой ещё на обучении. Таверна откроет свои двери, когда по навыку «Чтение» будет достигнут ранг
          «Железо»:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <UnlockRow label="📚 Чтение" rank={unlock.readingRank} ok={unlock.unlocked} />
        </div>
      </div>
    );
  }

  // ---------- Выбор класса ----------
  if (!character.characterClass) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4">
        <div className="mb-1 flex items-center gap-2 font-bold text-amber-200">
          <Swords size={16} /> Регистрация Авантюриста
        </div>
        <p className="mb-3 text-sm text-stone-400">
          Таверна распахнула двери! Выбери свой путь героя — его нельзя будет сменить.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(CLASS_META).map(([key, meta]) => (
            <button
              key={key}
              disabled={busy}
              className="group flex flex-col items-center gap-1 rounded-xl border border-stone-600/50 bg-stone-800/60 p-4 transition hover:border-amber-400/60 hover:bg-stone-700/60 disabled:opacity-50"
              onClick={() => void act(() => api.post('/child/dungeon/character', { clazz: key }))}
            >
              <span className="text-3xl">{meta.emoji}</span>
              <span className="font-bold text-amber-100">{meta.label}</span>
              <span className="text-center text-xs text-stone-400">{meta.hint}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Шапка героя */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-stone-900/60 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{CLASS_META[character.characterClass]?.emoji ?? '🗡️'}</span>
          <div>
            <div className="font-bold text-amber-100">
              {CLASS_META[character.characterClass]?.label ?? 'Авантюрист'}
              {character.victories > 0 && (
                <span className="ml-2 text-xs text-amber-300/80">🏆 побед: {character.victories}</span>
              )}
            </div>
            <div className="text-xs text-stone-400">
              {character.status === 'IN_DUNGEON' && 'Герой в подземелье'}
              {character.status === 'RESTING' && 'Герой отдыхает в подземелье до утра'}
              {character.status === 'FREE' && (session && !revealed ? 'Герой возвращается из похода…' : 'Герой в городе, готов к походу')}
            </div>
          </div>
        </div>
        {/* Выносливость */}
        <div className="min-w-40 flex-1 sm:max-w-56">
          <div className="mb-0.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-100">⚡ Выносливость</span>
            <span className="text-amber-200/70">
              {character.stamina}% / {character.maxStamina}%
            </span>
          </div>
          <div className="rpg-progress-track h-2.5">
            <div
              className={`rpg-progress-fill ${staminaPercent <= 20 ? '!bg-gradient-to-r !from-rose-500 !to-orange-400' : '!bg-gradient-to-r !from-lime-500 !to-emerald-400'}`}
              style={{ width: `${staminaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Лог похода */}
      {session && (
        <div className="rounded-xl border border-stone-600/40 bg-stone-900/80">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-700/60 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-amber-200">
              <ScrollText size={15} />
              {session.dungeonEmoji} {session.dungeonName}
              <span className={`rpg-badge border text-xs ${RANK_STYLE[session.rank] ?? ''}`}>
                Ранг {session.rank} · Ур. {session.monsterLevel}
              </span>
              <span className="text-xs font-normal text-stone-400">
                Комната {Math.min(revealedRoom, session.roomsTotal)} из {session.roomsTotal}
              </span>
            </div>
            <span
              className={`rpg-badge border text-xs ${
                revealed
                  ? session.status === 'RESTING'
                    ? 'border-indigo-500/40 text-indigo-300'
                    : session.status === 'WON'
                      ? 'border-emerald-500/40 text-emerald-300'
                      : 'border-rose-500/40 text-rose-300'
                  : 'border-sky-500/40 text-sky-300'
              }`}
            >
              {!revealed && '⚔️ Поход идёт'}
              {revealed && session.status === 'RESTING' && <><BedDouble size={12} className="mr-1 inline" /> Отдых до 9:00</>}
              {revealed && session.status === 'WON' && '🏆 Зачистено'}
              {revealed && session.status === 'LOST' && '🩸 Поражение'}
            </span>
          </div>
          <div ref={logRef} className="max-h-96 space-y-2 overflow-y-auto px-4 py-3">
            {visibleLogs.map((e, i) => (
              <div key={i} className="flex gap-2 text-sm leading-snug">
                <span className="shrink-0 font-mono text-xs text-stone-500">{fmtTime(e.at)}</span>
                <span className="text-stone-200">
                  <span className="mr-1">{e.icon}</span>
                  {e.text}
                </span>
              </div>
            ))}
          </div>
          {nextEntry && (
            <div className="flex items-center gap-2 border-t border-stone-700/60 px-4 py-2 text-xs text-stone-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              Герой путешествует… следующее событие примерно через {fmtCountdown(new Date(nextEntry.at).getTime() - now)}
            </div>
          )}
        </div>
      )}

      {/* Поражение: напоминание о сбросе (только после проигрывания таймлайна) */}
      {session?.status === 'LOST' && revealed && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
          Данж будет полностью сброшен: монстры воскреснут, сундуки и развилки сгенерируются заново.
        </p>
      )}

      {/* Таверна: случайное задание + снаряжение */}
      {character.status === 'FREE' && (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                <Swords size={15} /> Доска заданий таверны
              </div>
              <span className={`rpg-badge border text-xs ${RANK_STYLE[character.maxClearedRank] ?? 'border-stone-500/50 bg-stone-500/20 text-stone-300'}`}>
                🏅 Рекорд: {character.maxClearedRank === 'NONE' ? '—' : `Ранг ${character.maxClearedRank}`}
              </span>
            </div>
            <p className="mb-2 text-xs text-stone-400">
              Победи босса данжа своего максимального ранга — и Таверна начнёт предлагать задания выше рангом.
              Слишком лёгкие ранги навсегда исчезают из пула.
            </p>
            {character.stamina < 10 ? (
              <p className="rounded-xl border border-amber-500/20 bg-stone-900/60 px-4 py-3 text-sm text-stone-400">
                ⚡ Герой слишком устал. Выносливость восстановится завтра в 9:00 утра.
              </p>
            ) : rolling ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-amber-500/30 bg-stone-900/60 px-4 py-6">
                <span className="text-4xl">{rollEmoji}</span>
                <span className={`rpg-badge border text-lg ${RANK_STYLE[rollRank] ?? ''}`}>Ранг {rollRank}</span>
                <span className="text-xs text-stone-400">Таверна разыгрывает задание… 🎲</span>
              </div>
            ) : (
              <button
                className="rpg-btn flex w-full items-center justify-center gap-2 !py-3 text-base"
                disabled={busy}
                onClick={() => void rollQuest()}
              >
                <Dices size={18} /> Взять случайное задание
              </button>
            )}
          </div>
          {/* Трофеи из похода надеваются в Гардеробе («Мой герой») */}
          <p className="rounded-xl border border-amber-500/20 bg-stone-900/60 px-4 py-2 text-xs text-stone-400">
            🎒 Найденные в походах вещи надеваются в <span className="text-amber-300">Гардеробе</span> — открой «Мой герой» слева сверху.
          </p>
        </div>
      )}
    </div>
  );
}

function UnlockRow({ label, rank, ok }: { label: string; rank: string; ok: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
        ok ? 'border-emerald-500/40 text-emerald-300' : 'border-stone-600/40 text-stone-400'
      }`}
    >
      <span>{label}</span>
      <span className="font-semibold">
        {rank} {ok ? '✓' : `→ нужно «Железо»`}
      </span>
    </div>
  );
}
