import { useCallback, useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../../api/client';
import { MathSolveResult, MathStatsDto, MathTaskDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

interface Props {
  storeId: number;
}

export default function ChildMathView({ storeId }: Props) {
  const [tasks, setTasks] = useState<MathTaskDto[]>([]);
  const [stats, setStats] = useState<MathStatsDto | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allTasks, mathStats] = await Promise.all([
        api.get<MathTaskDto[]>('/child/tasks'),
        api.get<MathStatsDto>('/child/math-stats'),
      ]);
      setTasks(allTasks.filter((t) => t.storeId === storeId));
      setStats(mathStats);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const solve = async (task: MathTaskDto) => {
    const answer = (answers[task.id] ?? '').trim();
    if (!answer) {
      alert('Введите ответ');
      return;
    }
    setBusyId(task.id);
    try {
      const result = await api.post<MathSolveResult>(`/child/tasks/${task.id}/solve`, { answer });
      if (result.correct) {
        alert(`Верно! +${fmtAmount(result.points)} баллов`);
      } else {
        alert(`Неверно. Правильный ответ: ${result.correctAnswer}`);
      }
      // Задача исчезает из списка (независимо от верности ответа)
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner label="Загружаем задачи…" />;

  return (
    <div className="space-y-4">
      {stats && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="badge bg-indigo-100 text-indigo-700">Решено: {stats.correct}</span>
          <span className="badge bg-sky-100 text-sky-700">Попыток: {stats.total}</span>
          <span className="badge bg-emerald-100 text-emerald-700">
            Баллов: {fmtAmount(stats.pointsEarned)}
          </span>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState title="Задач пока нет" hint="Родитель скоро добавит новые задачи" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tasks.map((task) => (
            <div key={task.id} className="theme-card flex flex-col gap-3 rounded-2xl border p-5 shadow-sm">
              <div>
                <div className="font-bold">{task.title}</div>
                {task.description && <p className="theme-muted text-sm">{task.description}</p>}
                <div className="theme-accent-text mt-1 text-sm font-semibold">
                  +{fmtAmount(task.points)} за верный ответ
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Твой ответ"
                  value={answers[task.id] ?? ''}
                  onChange={(e) => setAnswers({ ...answers, [task.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void solve(task);
                  }}
                />
                <button
                  className="theme-btn shrink-0 rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={busyId === task.id}
                  onClick={() => void solve(task)}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}