import { ChevronRight } from 'lucide-react';
import { SkillId, SkillProgressDto } from '../../../api/types';
import { SKILLS } from '../../../lib/skills';
import { skillLevelFromXp } from '../../../lib/rpg';

interface Props {
  skills: SkillProgressDto[];
  onSelect: (skill: SkillId) => void;
}

export default function SkillsGrid({ skills, onSelect }: Props) {
  const byId = new Map<SkillId, SkillProgressDto>();
  skills.forEach((s) => byId.set(s.skill, s));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SKILLS.map((skill) => {
        const xp = byId.get(skill.id)?.xp ?? 0;
        const lvl = skillLevelFromXp(xp);
        const pct = Math.round(lvl.ratio * 100);
        return (
          <button
            key={skill.id}
            onClick={() => onSelect(skill.id)}
            className="rpg-panel group flex items-center gap-3 p-4 text-left transition hover:border-amber-600/60"
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl"
              style={{ borderColor: `${skill.color}55`, background: `${skill.color}14` }}
            >
              {skill.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold text-amber-100">{skill.name}</div>
              <div className="mt-0.5 text-xs text-stone-400">
                <span className="font-semibold text-amber-200/90">Ур. {lvl.level}</span> · {xp} XP · {pct}%
              </div>
              <div className="rpg-progress-track mt-1.5 h-2">
                <div
                  className="rpg-progress-fill"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-stone-500 transition group-hover:text-amber-300" />
          </button>
        );
      })}
    </div>
  );
}
