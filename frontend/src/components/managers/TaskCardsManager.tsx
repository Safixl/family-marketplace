import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { ChildDto, StoreDto, TaskCardDto, TaskItem } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

interface CardForm {
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  durationMinutes: string;
  rewardAmount: string;
  rewardStoreId: string;
  xpReward: string;
  houseBonus: string;
  rarity: string;
  hiddenReward: boolean;
  successPercent: string;
  active: boolean;
  childId: string;
  tasks: TaskItem[];
}

const EMPTY_FORM: CardForm = {
  title: '',
  description: '',
  icon: '🎴',
  difficulty: 'EASY',
  durationMinutes: '',
  rewardAmount: '',
  rewardStoreId: '',
  xpReward: '',
  houseBonus: '',
  rarity: 'COMMON',
  hiddenReward: false,
  successPercent: '80',
  active: true,
  childId: '',
  tasks: [{ q: '', a: '' }],
};

interface Props {
  store: StoreDto;
  skill: 'MATH' | 'HOUSE';
  onClose: () => void;
}

/**
 * Родитель: карточки с заданиями (математика / помощь по дому).
 * Создание/редактирование карточек + подтверждение запросов ребёнка.
 */
export default function TaskCardsManager({ store, skill, onClose }: Props) {
  const [cards, setCards] = useState<TaskCardDto[]>([]);
  const [requests, setRequests] = useState<TaskCardDto[]>([]);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaskCardDto | null>(null);
  const [form, setForm] = useState<CardForm>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, r, ch, st] = await Promise.all([
        api.get<TaskCardDto[]>(`/parent/task-cards?skill=${skill}`),
        api.get<TaskCardDto[]>(`/parent/task-card-requests?skill=${skill}`),
        api.get<ChildDto[]>('/parent/children'),
        api.get<{ id: number; name: string }[]>('/parent/stores'),
      ]);
      setCards(c);
      setRequests(r);
      setChildren(ch);
      setStores(st);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [skill]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (card: TaskCardDto) => {
    setEditing(card);
    setForm({
      title: card.title,
      description: card.description ?? '',
      icon: card.icon,
      difficulty: card.difficulty,
      durationMinutes: String(card.durationMinutes),
      rewardAmount: card.rewardAmount > 0 ? String(card.rewardAmount) : '',
      rewardStoreId: card.rewardStoreId != null ? String(card.rewardStoreId) : '',
      xpReward: card.xpReward > 0 ? String(card.xpReward) : '',
      houseBonus: card.houseBonus > 0 ? String(card.houseBonus) : '',
      rarity: card.rarity,
      hiddenReward: card.hiddenReward,
      successPercent: String(card.successPercent),
      active: card.active,
      childId: '',
      tasks: card.tasks.length > 0 ? card.tasks : [{ q: '', a: '' }],
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      alert('Укажите название карточки');
      return;
    }
    const tasks = form.tasks.filter((t) => t.q.trim() && t.a.trim());
    if (tasks.length === 0) {
      alert('Добавьте хотя бы одно задание с ответом');
      return;
    }
    const duration = Number(form.durationMinutes);
    if (!duration || duration <= 0) {
      alert('Укажите время на выполнение');
      return;
    }
    setBusy(true);
    try {
      const body = {
        skill,
        title: form.title.trim(),
        description: form.description.trim() || null,
        icon: form.icon.trim() || '🎴',
        difficulty: form.difficulty,
        tasks,
        durationMinutes: duration,
        rewardAmount: form.rewardAmount ? Number(form.rewardAmount) : 0,
        rewardStoreId: form.rewardStoreId ? Number(form.rewardStoreId) : null,
        xpReward: form.xpReward ? Number(form.xpReward) : 0,
        houseBonus: form.houseBonus ? Number(form.houseBonus) : 0,
        rarity: form.rarity,
        hiddenReward: form.hiddenReward,
        successPercent: Number(form.successPercent) || 80,
        active: form.active,
        childId: form.childId ? Number(form.childId) : null,
      };
      if (editing) {
        await api.put(`/parent/task-cards/${editing.id}`, body);
      } else {
        await api.post('/parent/task-cards', body);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (card: TaskCardDto) => {
    if (!window.confirm(`Удалить карточку «${card.title}»?`)) return;
    try {
      await api.del(`/parent/task-cards/${card.id}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const approve = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/task-card-requests/${id}/approve`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const reject = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/task-card-requests/${id}/reject`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Modal title={`${skill === 'MATH' ? '🎴 Карточки с заданиями' : '🏠 Помощь по дому'} · ${store.name}`} onClose={onClose} wide>
        <Spinner label="Загружаем карточки…" />
      </Modal>
    );
  }

  return (
    <Modal
      title={`${skill === 'MATH' ? '🎴 Карточки с заданиями' : '🏠 Помощь по дому'} · ${store.name}`}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">
        {/* Запросы ребёнка */}
        {requests.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-600">Запросы ребёнка</h3>
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{r.title}</div>
                    <div className="text-xs text-slate-500">
                      {r.childStatus === 'PENDING_PARENT' && skill === 'HOUSE'
                        ? 'отчёт о выполненной помощи'
                        : 'запрос на раскрытие карточки'}
                    </div>
                  </div>
                  <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void approve(r.id)}>
                    <CheckCircle2 size={14} /> {skill === 'HOUSE' ? 'Принять помощь' : 'Раскрыть'}
                  </button>
                  <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void reject(r.id)}>
                    <XCircle size={14} /> Отклонить
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-600">Карточки ({cards.length})</h3>
            <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={openCreate}>
              <Plus size={14} /> Новая карточка
            </button>
          </div>
          {cards.length === 0 ? (
            <EmptyState title="Карточек пока нет" hint="Создайте первую карточку с заданиями" />
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {cards.map((card) => (
                <div key={card.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {card.icon} {card.title}
                      {!card.active && <span className="ml-2 text-xs font-normal text-slate-400">(скрыта)</span>}
                    </div>
                    <div className="text-xs text-slate-500">
                      {card.difficulty} · {card.durationMinutes} мин · {card.tasks.length} заданий
                      {card.houseBonus > 0 && ` · +${card.houseBonus} к помощи`}
                      {card.rewardAmount > 0 && ` · +${fmtAmount(card.rewardAmount)}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200" onClick={() => openEdit(card)}>
                      <Pencil size={15} />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => void remove(card)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Редактировать карточку' : 'Новая карточка'} onClose={() => setModalOpen(false)} wide>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Название</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Иконка</label>
                <input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Описание</label>
              <textarea
                className="input min-h-[60px] resize-y"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Сложность</label>
                <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="EASY">Лёгкая</option>
                  <option value="MEDIUM">Средняя</option>
                  <option value="HARD">Сложная</option>
                </select>
              </div>
              <div>
                <label className="label">Время (мин)</label>
                <input type="number" min={1} className="input" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
              </div>
              <div>
                <label className="label">Ребёнок (пусто — всем)</label>
                <select className="input" value={form.childId} onChange={(e) => setForm({ ...form, childId: e.target.value })}>
                  <option value="">— всем —</option>
                  {children.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.avatarEmoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Задания */}
            <div>
              <label className="label">Задания (вопрос + ответ)</label>
              <div className="space-y-2">
                {form.tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Вопрос"
                      value={task.q}
                      onChange={(e) => {
                        const next = [...form.tasks];
                        next[i] = { ...next[i], q: e.target.value };
                        setForm({ ...form, tasks: next });
                      }}
                    />
                    <input
                      className="input w-40"
                      placeholder="Ответ"
                      value={task.a}
                      onChange={(e) => {
                        const next = [...form.tasks];
                        next[i] = { ...next[i], a: e.target.value };
                        setForm({ ...form, tasks: next });
                      }}
                    />
                    <button
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => setForm({ ...form, tasks: form.tasks.filter((_, j) => j !== i) })}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn-secondary mt-2 !px-3 !py-1.5 text-xs"
                onClick={() => setForm({ ...form, tasks: [...form.tasks, { q: '', a: '' }] })}
              >
                <Plus size={14} /> Добавить задание
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Награда ({store.currencyIcon})</label>
                <input type="number" min={0} step="0.01" className="input" value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })} />
              </div>
              <div>
                <label className="label">Магазин награды</label>
                <select className="input" value={form.rewardStoreId} onChange={(e) => setForm({ ...form, rewardStoreId: e.target.value })}>
                  <option value="">— без валюты —</option>
                  {stores.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Опыт (XP)</label>
                <input type="number" min={0} className="input" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} />
              </div>
            </div>

            {skill === 'HOUSE' ? (
              <div>
                <label className="label">Бонус к помощи в календаре (+n, максимум +6/день)</label>
                <input type="number" min={0} max={6} className="input" value={form.houseBonus} onChange={(e) => setForm({ ...form, houseBonus: e.target.value })} />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Редкость награды</label>
                  <select className="input" value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })}>
                    <option value="COMMON">Обычная (серая)</option>
                    <option value="RARE">Редкая (зелёная)</option>
                    <option value="UNCOMMON">Раритетная (синяя)</option>
                    <option value="EPIC">Эпическая (фиолетовая)</option>
                    <option value="LEGENDARY">Легендарная (оранжевая)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Порог успеха (%)</label>
                  <input type="number" min={1} max={100} className="input" value={form.successPercent} onChange={(e) => setForm({ ...form, successPercent: e.target.value })} />
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.hiddenReward}
                    onChange={(e) => setForm({ ...form, hiddenReward: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  Скрытая награда
                </label>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Активна (видна ребёнку)
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                Отмена
              </button>
              <button className="btn-primary" disabled={busy} onClick={() => void save()}>
                {editing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}