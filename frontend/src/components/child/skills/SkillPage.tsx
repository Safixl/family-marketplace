import { ArrowLeft } from 'lucide-react';
import { SkillProgressDto, StoreDto } from '../../../api/types';
import { SkillConfig } from '../../../lib/skills';
import { skillLevelFromXp } from '../../../lib/rpg';
import SkillModule from './SkillModule';

interface Props {
  config: SkillConfig;
  store: StoreDto | null;
  progress: SkillProgressDto | undefined;
  onBack: () => void;
}

export default function SkillPage({ config, store, progress, onBack }: Props) {
  const lvl = skillLevelFromXp(progress?.xp ?? 0);
  const pct = Math.round(lvl.ratio * 100);
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
      >
        <ArrowLeft size={15} /> Назад к навыкам
      </button>

      <div className="rpg-panel rpg-panel-gold flex flex-wrap items-center gap-4 p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-900 to-stone-900 text-3xl">
          {config.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="rpg-title text-xl">{config.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-300">
            <span className="font-bold text-amber-200">Ур. {lvl.level}</span>
            <span className="text-stone-400">·</span>
            <span>{progress?.xp ?? 0} XP</span>
            <span className="text-stone-400">·</span>
            <span>{pct}%</span>
            <span className="text-stone-400">·</span>
            <span>{progress?.unlockedAchievements ?? 0} ачивок</span>
          </div>
        </div>
        <div className="w-full sm:w-40">
          <div className="rpg-progress-track h-3">
            <div
              className="rpg-progress-fill"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>
      </div>

      <SkillModule config={config} store={store} progress={progress} />
    </div>
  );
}
