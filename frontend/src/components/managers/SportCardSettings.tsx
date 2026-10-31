import { useCallback, useEffect, useState } from 'react';
import { Check, Plus, Save, Trash2, X } from 'lucide-react';
import { api } from '../../api/client';
import {
  SportCardReviewDto,
  SportDirectionFullDto,
  SportRequestDto,
  SportTaskDto,
} from '../../api/types';
import { errMsg } from '../../lib/format';
import Modal from '../Modal';
import { Spinner } from '../ui';

type Panel = 'requests' | 'directions' | 'reviews';

/**
 * Управление навыком «Спорт и хобби» (родитель):
 * — запросы ребёнка на новые направления (создать направление + задания / отклонить);
 * — редактор заданий направлений: гибко меняем подходы, повторения, время, кг;
 * — проверка дейликов с множителем ×0/×1/×2.
 */
export default function SportCardSettings({ childId, onClose }: { childId?: number; onClose: () => void }) {
  const [panel, setPanel] = useState<Panel>('requests');
  const [requests, setRequests] = useState<SportRequestDto[]>([]);
  const [directions, setDirections] = useState<SportDirectionFullDto[] | null>(null);
  const [selectedDir, setSelectedDir] = useState<number | null>(null);
  const [tasks, setTasks] = useState<SportTaskDto[]>([]);
  const [reviews, setReviews] = useState<SportCardReviewDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDirName, setNewDirName] = useState('');
  const [newDirIcon, setNewDirIcon] = useState('🎯');
  const [newTask, setNewTask] = useState({ title: '', description: '', gradeMin: 1, gradeMax: 8 });

  const load = useCallback(async () => {
    try {
      const [r, rev] = await Promise.all([
        api.get<SportRequestDto[]>('/parent/sport-requests'),
        api.get<SportCardReviewDto[]>('/parent/sport-card-reviews'),
      ]);
      setRequests(r);
      setReviews(rev);
    } catch (e) {
      setError(errMsg(e));
    }
  }, [childId]);

  const loadDirections = useCallback(async () => {
    if (childId == null) {
      setDirections([]);
      return;
    }
    try {
      // Направления получаем через задачи любого из них; проще — через эндпоинт дня родителя нет,
      // поэтому используем список через /parent/sport-directions-list
      const list = await api.get<SportDirectionFullDto[]>(`/parent/sport-directions-list?childId=${childId}`);
      setDirections(list);
    } catch {
      setDirections([]);
    }
  }, [childId]);

  const loadTasks = useCallback(async (directionId: number) => {
    try {
      setTasks(await api.get<SportTaskDto[]>(`/parent/sport-directions/${directionId}/tasks`));
    } catch {
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadDirections();
  }, [load, loadDirections]);

  useEffect(() => {
    if (selectedDir != null) void loadTasks(selectedDir);
  }, [selectedDir, loadTasks]);

  const createFromRequest = async (r: SportRequestDto, name: string, icon: string) => {
    setBusy(true);
    try {
      await api.post('/parent/sport-directions', { childId: r.childId, name, icon, requestId: r.requestId });
      await Promise.all([load(), loadDirections()]);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const rejectRequest = async (requestId: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/sport-requests/${requestId}/reject`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const createDirection = async () => {
    if (childId == null || !newDirName.trim()) return;
    setBusy(true);
    try {
      await api.post('/parent/sport-directions', { childId, name: newDirName, icon: newDirIcon });
      setNewDirName('');
      await loadDirections();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const addTask = async () => {
    if (selectedDir == null || !newTask.title.trim()) return;
    setBusy(true);
    try {
      await api.post('/parent/sport-tasks', { directionId: selectedDir, ...newTask });
      setNewTask({ title: '', description: '', gradeMin: 1, gradeMax: 8 });
      await loadTasks(selectedDir);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const updateTask = async (t: SportTaskDto) => {
    setBusy(true);
    try {
      await api.put(`/parent/sport-tasks/${t.id}`, {
        directionId: t.directionId,
        title: t.title,
        description: t.description,
        gradeMin: t.gradeMin,
        gradeMax: t.gradeMax,
      });
      await loadTasks(t.directionId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    setBusy(true);
    try {
      await api.del(`/parent/sport-tasks/${taskId}`);
      await loadTasks(taskId ? (tasks.find((t) => t.id === taskId)?.directionId ?? selectedDir ?? 0) : selectedDir ?? 0);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const review = async (cardId: number, multiplier: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/sport-card-reviews/${cardId}/review`, { multiplier });
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const patchTask = (id: number, next: Partial<SportTaskDto>) => {
    setTasks((prev) => (prev ?? []).map((t) => (t.id === id ? { ...t, ...next } : t)));
  };

  return (
    <Modal title="⚽ Спорт и хобби — управление навыком" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex gap-1.5">
          {([
            ['requests', `📨 Запросы${requests.length ? ` (${requests.length})` : ''}`],
            ['directions', '🧭 Направления и задания'],
            ['reviews', `🔍 Проверка дейликов${reviews.length ? ` (${reviews.length})` : ''}`],
          ] as Array<[Panel, string]>).map(([id, label]) => (
            <button key={id} onClick={() => setPanel(id)} className={`rpg-tab ${panel === id ? 'rpg-tab-active' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        {error && <div className="card text-sm text-rose-600">{error}</div>}

        {panel === 'requests' && (
          requests.length === 0 ? (
            <div className="text-sm text-slate-500">Новых запросов от ребёнка нет. 👌</div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                Ребёнок просит новое направление. Создайте его (до 6 направлений всего) и добавьте задания,
                чтобы построить путь к новому увлечению.
              </p>
              {requests.map((r) => (
                <div key={r.requestId} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl">{r.childAvatar}</span>
                    <span className="font-semibold text-slate-800">
                      {r.childName} хочет: {r.name}
                    </span>
                  </div>
                  {r.comment && <div className="mt-1 text-sm text-slate-500">«{r.comment}»</div>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input className="input !w-16 text-center" value={r.childAvatar} disabled />
                    <input
                      className="input !w-40"
                      defaultValue={r.name}
                      onChange={(e) => {
                        r.name = e.target.value;
                      }}
                    />
                    <button
                      className="btn-primary !px-3 !py-1.5 text-xs"
                      disabled={busy}
                      onClick={() => void createFromRequest(r, r.name, '🎯')}
                    >
                      <Check size={14} /> Создать направление
                    </button>
                    <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void rejectRequest(r.requestId)}>
                      <X size={14} /> Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {panel === 'directions' && (
          childId == null ? (
            <div className="text-sm text-slate-500">Выберите ребёнка, чтобы управлять направлениями.</div>
          ) : directions === null ? (
            <Spinner label="Загружаем направления…" />
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {directions.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDir(d.id)}
                    className={`rpg-tab ${selectedDir === d.id ? 'rpg-tab-active' : ''}`}
                  >
                    {d.icon} {d.name} ({d.taskCount})
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <input className="input !w-14 text-center" value={newDirIcon} onChange={(e) => setNewDirIcon(e.target.value.slice(0, 2))} />
                <input
                  className="input !w-52"
                  placeholder="Новое направление…"
                  value={newDirName}
                  onChange={(e) => setNewDirName(e.target.value)}
                />
                <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy || !newDirName.trim()} onClick={() => void createDirection()}>
                  <Plus size={14} /> Добавить
                </button>
              </div>

              {selectedDir != null && (
                <div className="space-y-2">
                  <div className="text-sm font-bold text-slate-700">Задания направления</div>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <input
                      className="input !w-56"
                      placeholder="Например: Отожмись 15 раз"
                      value={newTask.title}
                      onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                    />
                    <input
                      className="input !w-64"
                      placeholder="Описание (техника, советы)"
                      value={newTask.description}
                      onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                    />
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      Класс от
                      <input
                        type="number"
                        min={1}
                        max={8}
                        className="input !w-14 text-center"
                        value={newTask.gradeMin}
                        onChange={(e) => setNewTask((p) => ({ ...p, gradeMin: Number(e.target.value) || 1 }))}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      до
                      <input
                        type="number"
                        min={1}
                        max={8}
                        className="input !w-14 text-center"
                        value={newTask.gradeMax}
                        onChange={(e) => setNewTask((p) => ({ ...p, gradeMax: Number(e.target.value) || 8 }))}
                      />
                    </label>
                    <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy || !newTask.title.trim()} onClick={() => void addTask()}>
                      <Plus size={14} /> Добавить
                    </button>
                  </div>
                  <div className="max-h-96 space-y-1.5 overflow-y-auto">
                    {tasks.map((t) => (
                      <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            className="input !w-60 text-sm"
                            value={t.title}
                            onChange={(e) => patchTask(t.id, { title: e.target.value })}
                          />
                          <input
                            className="input !w-64 text-sm"
                            value={t.description}
                            onChange={(e) => patchTask(t.id, { description: e.target.value })}
                          />
                          <label className="flex items-center gap-1 text-xs text-slate-500">
                            {t.gradeMin}–{t.gradeMax} кл.
                          </label>
                          <button className="btn-primary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => void updateTask(t)}>
                            <Save size={13} />
                          </button>
                          <button className="btn-secondary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => void deleteTask(t.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {panel === 'reviews' && (
          reviews.length === 0 ? (
            <div className="text-sm text-slate-500">Дейликов на проверке нет. 👌</div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                Проверь выполнение: ×0 — отклонить, ×1 — зачесть, ×2 — двойная награда.
              </p>
              {reviews.map((r) => (
                <div key={r.cardId} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl">{r.childAvatar}</span>
                    <span className="font-semibold text-slate-800">
                      {r.childName} · {r.directionIcon} {r.directionName}
                    </span>
                    <span className="text-xs text-slate-400">база: {r.baseReward} XP</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {r.taskTitles.map((t, i) => (
                      <li key={i}>• {t}</li>
                    ))}
                  </ul>
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 0)}>
                      <X size={14} /> ×0 Отклонить
                    </button>
                    <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 1)}>
                      <Check size={14} /> ×1 Зачесть
                    </button>
                    <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 2)}>
                      <Check size={14} /> ×2 Двойная
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Modal>
  );
}
