import { useEffect, useRef, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { ChildAchievementGroupDto } from '../../api/types';
import { tierForLevel } from '../../lib/achievementTiers';

interface Props {
  childId: number;
  achievements: ChildAchievementGroupDto[];
}

/** Звук «дзынь!» через Web Audio (без файлов). */
function playDing() {
  try {
    const ctx = new AudioContext();
    const play = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    play(880, 0, 0.25);
    play(1174, 0.12, 0.4);
  } catch {
    // аудио недоступно — пропускаем
  }
}

const AUTO_HIDE_MS = 4500;
const FADE_MS = 300;

function loadSeen(key: string): number[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

/**
 * Pop-up в стиле World of Warcraft: при разблокировке нового достижения
 * показывается баннер с «дзынь!» и титулом персонажа.
 *
 * Анти-спам: список уже показанных достижений хранится в localStorage (на ребёнка),
 * поэтому после перезагрузки/перехода по вкладкам история повторно НЕ всплывает.
 * При первом запуске в браузере текущие достижения отмечаются как просмотренные молча.
 */
export default function AchievementPopup({ childId, achievements }: Props) {
  // Ключ хранилища на ребёнка — не смешиваем достижения разных детей.
  const seenKey = `fm_seen_ach_${childId}`;
  const seenRef = useRef<Set<number>>(new Set(loadSeen(seenKey)));
  const hadKeyRef = useRef<boolean | null>(null);
  if (hadKeyRef.current === null) {
    try {
      hadKeyRef.current = localStorage.getItem(seenKey) != null;
    } catch {
      hadKeyRef.current = true;
    }
  }

  const [queue, setQueue] = useState<ChildAchievementGroupDto[]>([]);
  const [current, setCurrent] = useState<ChildAchievementGroupDto | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const persist = () => {
    try {
      localStorage.setItem(seenKey, JSON.stringify([...seenRef.current]));
    } catch {
      // localStorage может быть недоступен — не критично
    }
  };

  // Собираем очередь новых (ещё не показанных) достижений.
  useEffect(() => {
    const unlocked = achievements
      .filter((a) => a.unlocked && a.targetType && a.targetType !== 'NONE')
      .sort((a, b) => b.level - a.level);

    if (!hadKeyRef.current) {
      // Первый запуск в этом браузере: не спамим историей — молча отмечаем всё как просмотренное
      hadKeyRef.current = true;
      unlocked.forEach((a) => seenRef.current.add(a.achievementId));
      persist();
      return;
    }

    const fresh = unlocked.filter((a) => !seenRef.current.has(a.achievementId));
    if (fresh.length === 0) return;
    fresh.forEach((a) => seenRef.current.add(a.achievementId));
    persist();
    setQueue((q) => [...q, ...fresh]);
  }, [achievements, seenKey]);

  const close = () => {
    if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
    setVisible(false);
    if (fadeTimerRef.current != null) window.clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = window.setTimeout(() => setCurrent(null), FADE_MS);
  };

  // Показываем следующий попап из очереди.
  useEffect(() => {
    if (current || queue.length === 0) return;
    const next = queue[0];
    setQueue((q) => q.slice(1));
    setCurrent(next);
    playDing();
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    hideTimerRef.current = window.setTimeout(close, AUTO_HIDE_MS);
    return () => {
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, current]);

  // Размонтирование: чистим все таймеры.
  useEffect(() => {
    return () => {
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
      if (fadeTimerRef.current != null) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  if (!current) return null;
  const tier = tierForLevel(current.level);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div
        className={`wow-popup flex items-center gap-3 rounded-2xl border-2 bg-gradient-to-r ${tier.card} px-5 py-4 shadow-2xl transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}
      >
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white ${tier.iconBox}`}>
          {current.icon}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5">
              <Trophy size={13} /> Достижение получено
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${tier.badge}`}>
              {tier.emoji} {tier.name}
            </span>
          </div>
          <div className="truncate text-lg font-extrabold text-slate-900">{current.name}</div>
          {current.description && <div className="truncate text-sm text-slate-600">{current.description}</div>}
        </div>
        <button
          onClick={close}
          className="pointer-events-auto ml-1 shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-black/10 hover:text-slate-700"
          title="Закрыть"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
