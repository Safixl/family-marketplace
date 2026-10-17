import { useMemo } from 'react';
import { SkillId, SkillProgressDto } from '../../../api/types';
import { SKILLS } from '../../../lib/skills';
import { skillLevelFromProgress } from '../../../lib/rpg';

interface Props {
  skills: SkillProgressDto[];
  onSelect: (skill: SkillId) => void;
}

const SIZE = 420;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 150;
const LABEL_R = 196;

function polar(radius: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function hexPoints(radius: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const p = polar(radius, -90 + i * 60);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export default function SkillHexagon({ skills, onSelect }: Props) {
  const byId = useMemo(() => {
    const map = new Map<SkillId, SkillProgressDto>();
    skills.forEach((s) => map.set(s.skill, s));
    return map;
  }, [skills]);

  const valuePoints = useMemo(() => {
    return SKILLS.map((skill, i) => {
      const value = byId.get(skill.id)?.progress ?? 0;
      const p = polar((R * value) / 100, -90 + i * 60);
      return { ...p, value, skill };
    });
  }, [byId]);

  const fillPath = valuePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full select-none">
        <defs>
          <radialGradient id="hex-fill" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.25" />
          </radialGradient>
          <filter id="hex-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Сетка: концентрические шестиугольники */}
        {[25, 50, 75, 100].map((pct) => (
          <polygon
            key={pct}
            points={hexPoints((R * pct) / 100)}
            fill="none"
            stroke={pct === 100 ? '#4a3a24' : '#33291c'}
            strokeWidth={pct === 100 ? 1.5 : 1}
          />
        ))}

        {/* Оси */}
        {SKILLS.map((skill, i) => {
          const p = polar(R, -90 + i * 60);
          return (
            <line
              key={skill.id}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke="#3d2f1f"
              strokeWidth={1}
            />
          );
        })}

        {/* Заливка прогресса */}
        <polygon
          points={fillPath}
          fill="url(#hex-fill)"
          stroke="#fbbf24"
          strokeWidth={2}
          strokeLinejoin="round"
          filter="url(#hex-glow)"
        />

        {/* Вершины-кнопки */}
        {valuePoints.map(({ x, y, value, skill }) => {
          const level = skillLevelFromProgress(value);
          return (
            <g
              key={skill.id}
              transform={`translate(${x},${y})`}
              className="cursor-pointer"
              onClick={() => onSelect(skill.id)}
            >
              <circle r={16} fill="#17120c" stroke={skill.color} strokeWidth={2} />
              <circle r={16} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={3} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
              >
                {skill.icon}
              </text>
              <title>{`${skill.name}: ур. ${level}`}</title>
            </g>
          );
        })}

        {/* Подписи */}
        {SKILLS.map((skill, i) => {
          const p = polar(LABEL_R, -90 + i * 60);
          const value = byId.get(skill.id)?.progress ?? 0;
          const anchor =
            Math.abs(p.x - CX) < 8 ? 'middle' : p.x > CX ? 'start' : 'end';
          const dy = Math.abs(p.y - CY) < 8 ? (p.y > CY ? 18 : -14) : 4;
          return (
            <g
              key={skill.id}
              transform={`translate(${p.x},${p.y})`}
              className="cursor-pointer"
              onClick={() => onSelect(skill.id)}
            >
              <text
                textAnchor={anchor}
                dominantBaseline="middle"
                dy={dy}
                fontSize={13}
                fontWeight={700}
                fill="#e7dcc8"
              >
                {skill.name}
              </text>
              <text
                textAnchor={anchor}
                dominantBaseline="middle"
                dy={dy + 15}
                fontSize={11}
                fontWeight={600}
                fill={value >= 10 ? '#fbbf24' : '#7a6c58'}
              >
                Ур. {skillLevelFromProgress(value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
