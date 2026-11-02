import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { api } from '../../api/client';
import { DailySkillDto, DailyStateDto } from '../../api/types';
import { errMsg } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';
import TaskCardsTab from './skills/tabs/TaskCardsTab';
import LangCardView from './skills/tabs/LangCardView';
import SportCardView from './skills/tabs/SportCardView';

/**
 * Экран «Дейлики»: ежедневные задания по навыкам.
 * Математика — динамические карточки (до 3 в день, Матриксы), логика — логик-карточки (IQ-коины),
 * язык — 6 видов заданий + словарь + манускрипт (лингво-мили),
 * спорт и хобби — направления и дейлик с проверкой родителем (×0/×1/×2).
 */
export default function ChildDailiesTab() {
  const [state, setState] = useState<DailyStateDto | null>(null);

  const load = useCallback(async () => {
    try {
      setState(await api.get<DailyStateDto>('/child/dailies'));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!state) return <Spinner label="Загружаем дейлики…" />;

  if (state.skills.length === 0) {
    return (
      <EmptyState
        title="Дейлики ещё не открыты"
        hint="Попроси родителя включить магазины логики, языка, спорта или математики — и здесь появятся ежедневные задания"
        icon={<Sparkles size={40} />}
      />
    );
  }

  const totalDone = state.skills.reduce((sum, s) => sum + (s.tasksDone ?? 0), 0);
  const totalTasks = state.skills.reduce((sum, s) => sum + (s.tasksTotal ?? 0), 0);
  const allDone = state.skills.every((s) => s.completed);

  return (
    <div className="space-y-6">
      {/* Сводка дня: счётчик по заданиям (3 логика + 3 математика + 3 язык + спорт + чтение + дом) */}
      <section className="rpg-panel rpg-panel-gold p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="rpg-title flex items-center gap-2 text-xl">
            <Sparkles size={22} className="text-amber-400" /> Дейлики на сегодня
          </h2>
          {allDone && (
            <span className="rpg-badge border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
              <Trophy size={13} /> Все дейлики выполнены!
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-stone-400">
          {state.day} · выполнено {totalDone} из {totalTasks} заданий за день
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
            style={{ width: `${totalTasks > 0 ? Math.min(100, (totalDone / totalTasks) * 100) : 0}%` }}
          />
        </div>
      </section>

      {state.skills.map((skill) => (
        <DailySkillCard key={skill.skill} skill={skill} />
      ))}
    </div>
  );
}

// ---------- Карточка одного навыка ----------

function DailySkillCard({ skill }: { skill: DailySkillDto }) {
  const isLogic = skill.skill === 'LOGIC';
  const isMath = skill.skill === 'MATH';
  const isLang = skill.skill === 'LANG';
  const isSport = skill.skill === 'SPORT';
  const isReading = skill.skill === 'READING';
  const isHouse = skill.skill === 'HOUSE';

  return (
    <section className="rpg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-amber-100">
          <span className="text-2xl">{skill.icon}</span> {skill.name}
        </h3>
        <div className="flex items-center gap-2">
          {skill.fullClear && (
            <span className="rpg-badge border border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-300">
              <CheckCircle2 size={12} /> Full Clear +2 XP
            </span>
          )}
          <span className="rpg-badge border border-amber-500/30 bg-amber-500/15 text-amber-300">
            {skill.currencyIcon} {skill.pointsEarned}/{skill.pointsTarget}
          </span>
        </div>
      </div>

      {/* Математика: карточки с заданиями (выбор по сложности, решение на 80%+) */}
      {isMath && (
        <div className="mt-3">
          <TaskCardsTab skill="MATH" />
        </div>
      )}

      {/* Логика: динамические логик-карточки (зеркало математики, до 3 в день) */}
      {isLogic && (
        <div className="mt-3">
          <TaskCardsTab skill="LOGIC" />
        </div>
      )}

      {/* Язык: динамические карточки (6 видов заданий, словарь, манускрипт) */}
      {isLang && (
        <div className="mt-3">
          <LangCardView />
        </div>
      )}

      {/* Спорт и хобби: направления + дейлик с проверкой родителем */}
      {isSport && (
        <div className="mt-3">
          <SportCardView />
        </div>
      )}

      {/* Чтение: страницы за день */}
      {isReading && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-stone-300">Прочитано страниц</span>
            <span className="font-bold text-amber-300">
              {skill.pointsEarned} из {skill.pointsTarget}
            </span>
          </div>
          <div className="rpg-progress-track h-3">
            <div
              className="rpg-progress-fill"
              style={{ width: `${skill.pointsTarget > 0 ? Math.min(100, (skill.pointsEarned / skill.pointsTarget) * 100) : 0}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-stone-400">
            Отмечай текущую страницу в навыке «Чтение» — разница между отметками засчитывается в дейлик.
          </p>
        </div>
      )}

      {/* Дом: проверенная комната / помощь */}
      {isHouse && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-stone-300">Комната проверена / помощь</span>
            <span className="font-bold text-amber-300">
              {skill.pointsEarned} из {skill.pointsTarget}
            </span>
          </div>
          <div className="rpg-progress-track h-3">
            <div
              className="rpg-progress-fill"
              style={{ width: `${skill.pointsTarget > 0 ? Math.min(100, (skill.pointsEarned / skill.pointsTarget) * 100) : 0}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-stone-400">
            Попроси родителя проверить комнату на главной или выполни «Помощь по дому» в навыке.
          </p>
        </div>
      )}
    </section>
  );
}
