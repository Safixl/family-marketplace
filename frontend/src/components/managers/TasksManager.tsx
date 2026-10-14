import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { ChildDto, MathAttemptDto, MathStatsDto, MathTaskDto, StoreDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

interface TaskForm {
  title: string;
  description: string;
  answer: string;
  points: string;
  active: boolean;
}

const EMPTY_TASK: TaskForm = { title: '', description: '', answer: '', points: '', active: true };

interface Props {
  store: StoreDto;
  onClose: () => void;
}

export default function TasksManager({ store, onClose }: Props) {
  const [tasks, setTasks] = useState<MathTaskDto[]>([]);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [childId, setChildId] = useState('');
  const [stats, setStats] = useState<MathStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [taskModal, setTaskModal] = useState(false);
  const [editing, setEditing] = useState<MathTaskDto | null>(null);
  const [form, setForm] = useState<TaskForm>(EMPTY_TASK);

  const loadTasks = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setTasks(await api.get<MathTaskDto[]>(`/parent/children/${id}/tasks`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  const loadChildren = useCallback(async () => {
    try {
      const list = await api.get<ChildDto[]>('/parent/children');
      setChildren(list.filter((c) => c.active));
      if (list.length > 0 && !childId) {
        setChildId(String(list[0].id));
      }
    } catch (e) {
      alert(errMsg(e));
    }
  }, [childId]);

  const loadStats = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setStats(await api.get<MathStatsDto>(`/parent/children/${id}/math-stats`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadChildren();
      setLoading(false);
    })();
  }, [loadChildren]);

  useEffect(() => {
    if (!childId) return;
    void loadTasks(childId);
    void loadStats(childId);
  }, [childId, loadTasks, loadStats]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_TASK);
    setTaskModal(true);
  };

  const openEdit = (task: MathTaskDto) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      answer: '',
      points: String(task.points),
      active: task.active,
    });
    setTaskModal(true);
  };

  const saveTask = async () => {
    if (!form.title.trim()) {
      alert('Укажите название задачи');
      return;
    }
    if (!form.answer.trim()) {
      alert('Укажите правильный ответ');
      return;
    }
    const points = Number(form.points);
    if (!Number.isFinite(points) || points < 0) {
      alert('Баллы должны быть неотрицательным числом');
      return;
    }
    setBusy(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        answer: form.answer.trim(),
        points,
        active: form.active,
      };
      if (editing) {
        await api.put(`/parent/tasks/${editing.id}`, body);
      } else {
        await api.post(`/parent/stores/${store.id}/children/${childId}/tasks`, body);
      }
      setTaskModal(false);
      await loadTasks(childId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const removeTask = async (task: MathTaskDto) => {
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) return;
    try {
      await api.del(`/parent/tasks/${task.id}`);
      await loadTasks(childId);
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const successRate = stats && stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <Modal title={`🧮 ${store.name} — задачи и статистика`} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="label">Ребенок</label>
            <select className="input" value={childId} onChange={(e) => setChildId(e.target.value)}>
              <option value="">— выберите —</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.avatarEmoji} {c.name}
                </option>
              ))}
            </select>
          </div>
          {stats && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="badge bg-indigo-100 text-indigo-700">Решено: {stats.correct}</span>
              <span className="badge bg-sky-100 text-sky-700">Попыток: {stats.total}</span>
              <span className="badge bg-emerald-100 text-emerald-700">
                Баллов: {fmtAmount(stats.pointsEarned)}
              </span>
              <span className="badge bg-amber-100 text-amber-700">Успех: {successRate}%</span>
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-600">Задачи ребёнка ({tasks.length})</h3>
            <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={openCreate}>
              <Plus size={14} /> Добавить задачу
            </button>
          </div>
          {loading ? (
            <Spinner label="Загружаем задачи…" />
          ) : tasks.length === 0 ? (
            <EmptyState title="Задач пока нет" hint="Составьте задачи — ребёнок решает их и получает баллы" />
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {task.title}
                      {!task.active && <span className="ml-2 text-xs font-normal text-slate-400">(скрыта)</span>}
                    </div>
                    {task.description && (
                      <div className="truncate text-xs text-slate-500">{task.description}</div>
                    )}
                  </div>
                  <div className="shrink-0 text-sm font-bold text-indigo-600">+{fmtAmount(task.points)}</div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                      onClick={() => openEdit(task)}
                      title="Редактировать"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => void removeTask(task)}
                      title="Удалить"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {stats && stats.attempts.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-600">Попытки решения</h3>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {stats.attempts.map((attempt: MathAttemptDto) => (
                <div key={attempt.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2">
                  {attempt.correct ? (
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle size={18} className="shrink-0 text-rose-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{attempt.taskTitle}</div>
                    <div className="text-xs text-slate-500">
                      Ответ: «{attempt.answer}» · {new Date(attempt.attemptedAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <div className={`shrink-0 text-sm font-bold ${attempt.correct ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {attempt.correct ? `+${fmtAmount(attempt.points)}` : 'неверно'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {taskModal && (
        <Modal title={editing ? 'Редактировать задачу' : 'Новая задача'} onClose={() => setTaskModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Название</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>
            <div>
              <label className="label">Условие</label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Например: Сколько будет 7 × 8?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Правильный ответ</label>
                <input className="input" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
              </div>
              <div>
                <label className="label">Баллы за решение</label>
                <input className="input" type="number" min="0" step="0.5" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Задача активна (видна ребенку)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setTaskModal(false)}>Отмена</button>
              <button className="btn-primary" disabled={busy} onClick={() => void saveTask()}>Сохранить</button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}