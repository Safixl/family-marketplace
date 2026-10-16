import { useCallback, useEffect, useState } from 'react';
import { Brain, CheckCircle2, Dumbbell, Sparkles, Trophy } from 'lucide-react';
import { api } from '../../api/client';
import { DailySkillDto, DailyStateDto } from '../../api/types';
import { errMsg } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

/**
 * Экран «Дейлики»: ежедневные задания по навыкам.
 * Логика и математика — мини-задачи с авто-проверкой (1 верный ответ = 1 балл).
 * Язык — карточки слов (1 слово = 1 лингво-миля).
 * Спорт — минуты активности и шаги (10 мин = 1 очко, 2000 шагов = 1 очко).
 * Идеальное прохождение блока (Full Clear) даёт +2 XP.
 */
export default function ChildDailiesTab() {
  const [state, setState] = useState<DailyStateDto | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

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

  const submitAnswer = async (skill: string, taskIndex: number) => {
    const key = `${skill}-${taskIndex}`;
    const answer = (answers[key] ?? '').trim();
    if (!answer) return;
    setBusy(true);
    try {
      await api.post(`/child/dailies/${skill === 'MATH' ? 'math' : 'logic'}/answer`, { taskIndex, answer });
      setAnswers((prev) => ({ ...prev, [key]: '' }));
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const learnWords = async (_skill: string, wordIds: string[]) => {
    if (wordIds.length === 0) return;
    setBusy(true);
    try {
      await api.post('/child/dailies/lang/learn', { wordIds });
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const logSport = async (_skill: string, minutes: number, steps: number) => {
    if (minutes <= 0 && steps <= 0) return;
    setBusy(true);
    try {
      await api.post('/child/dailies/sport/log', { minutes, steps });
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

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

  const totalEarned = state.skills.reduce((sum, s) => sum + s.pointsEarned, 0);
  const totalTarget = state.skills.reduce((sum, s) => sum + s.pointsTarget, 0);
  const allDone = state.skills.every((s) => s.completed);

  return (
    <div className="space-y-6">
      {/* Сводка дня */}
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
          {state.day} · заработано {totalEarned} из {totalTarget} баллов за день
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
            style={{ width: `${totalTarget > 0 ? Math.min(100, (totalEarned / totalTarget) * 100) : 0}%` }}
          />
        </div>
      </section>

      {state.skills.map((skill) => (
        <DailySkillCard
          key={skill.skill}
          skill={skill}
          answers={answers}
          busy={busy}
          onAnswerChange={(taskIndex, value) => setAnswers((prev) => ({ ...prev, [`${skill.skill}-${taskIndex}`]: value }))}
          onSubmitAnswer={(taskIndex) => void submitAnswer(skill.skill, taskIndex)}
          onLearn={learnWords}
          onSport={logSport}
        />
      ))}
    </div>
  );
}

// ---------- Карточка одного навыка ----------

interface CardProps {
  skill: DailySkillDto;
  answers: Record<string, string>;
  busy: boolean;
  onAnswerChange: (taskIndex: number, value: string) => void;
  onSubmitAnswer: (taskIndex: number) => void;
  onLearn: (skill: string, wordIds: string[]) => void;
  onSport: (skill: string, minutes: number, steps: number) => void;
}

function DailySkillCard({ skill, answers, busy, onAnswerChange, onSubmitAnswer, onLearn, onSport }: CardProps) {
  const isLogic = skill.skill === 'LOGIC';
  const isMath = skill.skill === 'MATH';
  const isLang = skill.skill === 'LANG';
  const isSport = skill.skill === 'SPORT';

  const [minutes, setMinutes] = useState(0);
  const [steps, setSteps] = useState(0);

  const learnedCount = skill.words.filter((w) => w.learned).length;

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

      {/* Логика и математика: задачи с ответами */}
      {(isLogic || isMath) && (
        <div className="mt-3 space-y-3">
          {skill.tasks.map((task) => {
            const value = answers[`${skill.skill}-${task.index}`] ?? '';
            return (
              <div key={task.index} className="flex flex-wrap items-center gap-2 rounded-xl bg-stone-900/60 p-3">
                <Brain size={16} className="shrink-0 text-violet-400" />
                <span className="min-w-0 flex-1 text-sm text-stone-200">{task.question}</span>
                <input
                  className="rpg-input w-32"
                  placeholder="Ответ"
                  value={value}
                  disabled={busy}
                  onChange={(e) => onAnswerChange(task.index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSubmitAnswer(task.index);
                  }}
                />
                <button
                  className="rpg-btn !px-3 !py-1.5 text-xs"
                  disabled={busy || !value.trim()}
                  onClick={() => onSubmitAnswer(task.index)}
                >
                  Проверить
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Язык: карточки слов */}
      {isLang && (
        <div className="mt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {skill.words.map((w) => (
              <button
                key={w.id}
                disabled={busy || w.learned}
                onClick={() => void onLearn(skill.skill, [w.id])}
                className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm transition ${
                  w.learned
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-stone-700 bg-stone-900/60 text-stone-200 hover:border-amber-500/40'
                }`}
              >
                <span className="font-bold">{w.word}</span>
                <span className="text-stone-400">{w.translation}</span>
                {w.learned && <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />}
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-stone-400">
            Выучено {learnedCount} из {skill.words.length}. Нажми на карточку, чтобы отметить слово.
          </div>
        </div>
      )}

      {/* Спорт: минуты и шаги */}
      {isSport && (
        <div className="mt-3">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-1 flex-col gap-1 text-xs text-stone-400">
              Минуты активности (10 мин = 1 очко)
              <input
                type="number"
                min={0}
                className="rpg-input"
                value={minutes || ''}
                disabled={busy}
                onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-stone-400">
              Шаги (2000 = 1 очко)
              <input
                type="number"
                min={0}
                className="rpg-input"
                value={steps || ''}
                disabled={busy}
                onChange={(e) => setSteps(Math.max(0, Number(e.target.value)))}
              />
            </label>
            <button
              className="rpg-btn"
              disabled={busy || (minutes <= 0 && steps <= 0)}
              onClick={() => {
                void onSport(skill.skill, minutes, steps);
                setMinutes(0);
                setSteps(0);
              }}
            >
              <Dumbbell size={16} /> Записать
            </button>
          </div>
          <div className="mt-2 text-sm text-stone-400">
            Записано: {skill.minutesLogged} мин · {skill.stepsLogged} шагов
          </div>
        </div>
      )}
    </section>
  );
}
