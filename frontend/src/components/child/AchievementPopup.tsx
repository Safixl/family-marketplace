import { useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import { ChildAchievementGroupDto } from '../../api/types';
import { tierForLevel } from '../../lib/achievementTiers';

interface Props {
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

/**
 * Pop-up в стиле World of Warcraft: при разблокировке нового достижения
 * показывается баннер с «дзынь!» и титулом персонажа.
 */
export default function AchievementPopup({ achievements }: Props) {
  const [current, setCurrent] = useState<ChildAchievementGroupDto | null>(null);
  const seenRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const unlocked = achievements
      .filter((a) => a.unlocked && a.targetType && a.targetType !== 'NONE')
      .sort((a, b) => b.level - a.level);
    const fresh = unlocked.find((a) => !seenRef.current.has(a.achievementId));
    if (!fresh) return;
    seenRef.current.add(fresh.achievementId);
    playDing();
    setCurrent(fresh);
    const timer = setTimeout(() => setCurrent(null), 4500);
    return () => clearTimeout(timer);
  }, [achievements]);

  if (!current) return null;
  const tier = tierForLevel(current.level);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div
        className={`wow-popup flex items-center gap-3 rounded-2xl border-2 bg-gradient-to-r ${tier.card} px-5 py-4 shadow-2xl`}
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
      </div>
    </div>
  );
}
