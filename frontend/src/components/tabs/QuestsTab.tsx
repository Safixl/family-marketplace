import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  ScrollText,
  Trash2,
  XCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import {
  ChildDto,
  QuestDto,
  QuestSubmissionDto,
  SeasonalEventDto,
  StoreDto,
} from '../../api/types';
import { errMsg, fmtAmount, fmtDate } from '../../lib/format';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

interface QuestForm {
  childId: string;
  type: string;
  title: string;
  description: string;
  basicDescription: string;
  acceptDescription: string;
  durationMinutes: string;
  cooldownHours: string;
  icon: string;
  rewardStoreId: string;
  rewardAmount: string;
  xpReward: string;
  seasonalEventId: string;
  repeatable: boolean;
  active: boolean;
}

const EMPTY_FORM: QuestForm = {
  childId: '',
  type: 'STORY',
  title: '',
  description: '',
  basicDescription: '',
  acceptDescription: '',
  durationMinutes: '',
  cooldownHours: '',
  icon: '📜',
  rewardStoreId: '',
  rewardAmount: '',
  xpReward: '',
  seasonalEventId: '',
  repeatable: false,
  active: true,
};

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'DAILY', label: 'Дейлик (повторяемый)' },
  { value: 'STORY', label: 'Сюжетный (разовый)' },
  { value: 'SEASONAL', label: 'Сезонный (жетоны)' },
];

type QuestFilter = 'draft' | 'available' | 'active' | 'completed' | 'dailies';

const QUEST_FILTERS: Array<{ id: QuestFilter; label: string }> = [
  { id: 'draft', label: 'В Разработке' },
  { id: 'available', label: 'Доступные' },
  { id: 'active', label: 'Активные' },
  { id: 'completed', label: 'Завершенные' },
  { id: 'dailies', label: 'Дейлики' },
];

/**
 * Квесты ГМа: родитель создаёт дейлики и сюжетные квесты с наградой
 * [валюта магазина + общий XP], одобряет или отклоняет заявки детей.
 * Вкладки: В Разработке / Доступные / Активные / Завершенные / Дейлики.
 */
export default function QuestsTab() {
  const [quests, setQuests] = useState<QuestDto[]>([]);
  const [submissions, setSubmissions] = useState<QuestSubmissionDto[]>([]);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [events, setEvents] = useState<SeasonalEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [questFilter, setQuestFilter] = useState<QuestFilter>('active');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QuestDto | null>(null);
  const [form, setForm] = useState<QuestForm>(EMPTY_FORM);

  const [statusFilter, setStatusFilter] = useState('PENDING');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [q, s, c, st, ev] = await Promise.all([
        api.get<QuestDto[]>('/parent/quests'),
        api.get<QuestSubmissionDto[]>('/parent/quest-submissions?status=ALL'),
        api.get<ChildDto[]>('/parent/children'),
        api.get<StoreDto[]>('/parent/stores'),
        api.get<SeasonalEventDto[]>('/parent/seasonal-events'),
      ]);
      setQuests(q);
      setSubmissions(s);
      setChildren(c);
      setStores(st);
      setEvents(ev);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (quest: QuestDto) => {
    setEditing(quest);
    setForm({
      childId: quest.childId != null ? String(quest.childId) : '',
      type: quest.type,
      title: quest.title,
      description: quest.description ?? '',
      basicDescription: quest.basicDescription ?? '',
      acceptDescription: quest.acceptDescription ?? '',
      durationMinutes: quest.durationMinutes != null ? String(quest.durationMinutes) : '',
      cooldownHours: quest.cooldownHours > 0 ? String(quest.cooldownHours) : '',
      icon: quest.icon,
      rewardStoreId: quest.rewardStoreId != null ? String(quest.rewardStoreId) : '',
      rewardAmount: quest.rewardAmount > 0 ? String(quest.rewardAmount) : '',
      xpReward: quest.xpReward > 0 ? String(quest.xpReward) : '',
      seasonalEventId: quest.seasonalEventId != null ? String(quest.seasonalEventId) : '',
      repeatable: quest.repeatable,
      active: quest.active,
    });
    setModalOpen(true);
  };

  const saveQuest = async () => {
    setBusy(true);
    try {
      const payload = {
        childId: form.childId ? Number(form.childId) : null,
        type: form.type,
        title: form.title,
        description: form.description || null,
        basicDescription: form.basicDescription || null,
        acceptDescription: form.acceptDescription || null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        cooldownHours: form.cooldownHours ? Number(form.cooldownHours) : 0,
        icon: form.icon || '📜',
        rewardStoreId: form.rewardStoreId ? Number(form.rewardStoreId) : null,
        rewardAmount: form.rewardAmount ? Number(form.rewardAmount) : 0,
        xpReward: form.xpReward ? Number(form.xpReward) : 0,
        seasonalEventId: form.type === 'SEASONAL' && form.seasonalEventId ? Number(form.seasonalEventId) : null,
        repeatable: form.repeatable,
        active: form.active,
      };
      if (editing) {
        await api.put(`/parent/quests/${editing.id}`, payload);
      } else {
        await api.post('/parent/quests', payload);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const deleteQuest = async (id: number) => {
    if (!confirm('Удалить квест?')) return;
    try {
      await api.del(`/parent/quests/${id}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const approve = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/quest-submissions/${id}/approve`);
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
      await api.post(`/parent/quest-submissions/${id}/reject`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const filtered = statusFilter === 'ALL' ? submissions : submissions.filter((s) => s.status === statusFilter);
  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;

  // Группировка квестов по вкладкам
  const filteredQuests = quests.filter((q) => {
    switch (questFilter) {
      case 'draft':
        return !q.active;
      case 'available':
        return q.active && !q.repeatable && q.activeChildren === 0 && q.doneChildren === 0;
      case 'active':
        return q.activeChildren > 0;
      case 'completed':
        return q.doneChildren > 0 && !q.repeatable;
      case 'dailies':
        return q.active && q.repeatable;
      default:
        return true;
    }
  });

  const markDone = async (quest: QuestDto) => {
    setBusy(true);
    try {
      await api.put(`/parent/quests/${quest.id}`, { active: true });
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Загружаем квесты…" />;

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {/* Пул квестов */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Пул квестов</h2>
            <p className="text-sm text-slate-500">
              Дейлики (повторяемые) и сюжетные квесты. Награда: валюта магазина + общий опыт.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={16} /> Новый квест
          </button>
        </div>

        {/* Вкладки-группы */}
        <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {QUEST_FILTERS.map((f) => {
            const count =
              f.id === 'draft'
                ? quests.filter((q) => !q.active).length
                : f.id === 'available'
                  ? quests.filter((q) => q.active && !q.repeatable && q.activeChildren === 0 && q.doneChildren === 0).length
                  : f.id === 'active'
                    ? quests.filter((q) => q.activeChildren > 0).length
                    : f.id === 'completed'
                      ? quests.filter((q) => q.doneChildren > 0 && !q.repeatable).length
                      : quests.filter((q) => q.active && q.repeatable).length;
            return (
              <button
                key={f.id}
                onClick={() => setQuestFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  questFilter === f.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        {filteredQuests.length === 0 ? (
          <EmptyState
            title="В этой группе квестов пока пусто"
            hint="Создайте квест или переключите вкладку"
            icon={<ScrollText size={40} />}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredQuests.map((quest) => (
              <div key={quest.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                      {quest.icon}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">{quest.title}</div>
                      <div className="text-xs text-slate-500">
                        {quest.type === 'DAILY' && 'Дейлик'}
                        {quest.type === 'STORY' && 'Сюжетный'}
                        {quest.type === 'SEASONAL' && 'Сезонный'}
                        {quest.repeatable && ' · повторяемый'}
                        {quest.childId != null && ' · персональный'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!quest.active && (
                      <button
                        onClick={() => void markDone(quest)}
                        disabled={busy}
                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                        title="Доделан — переместить в Доступные/Дейлики"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(quest)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => void deleteQuest(quest.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {quest.description && <p className="mt-2 text-sm text-slate-500">{quest.description}</p>}
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  {quest.rewardAmount > 0 && quest.currencyIcon && (
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700">
                      {quest.currencyIcon} +{fmtAmount(quest.rewardAmount, quest.currencyName ?? undefined)}
                    </span>
                  )}
                  {quest.xpReward > 0 && (
                    <span className="rounded-lg bg-sky-50 px-2 py-1 text-sky-700">+{quest.xpReward} XP</span>
                  )}
                  {!quest.active && (
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-500">выключен</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Лента верификации */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Лента верификации</h2>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === st ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {st === 'PENDING' && `Ожидают (${pendingCount})`}
                {st === 'APPROVED' && 'Одобрено'}
                {st === 'REJECTED' && 'Отклонено'}
                {st === 'ALL' && 'Все'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Заявок нет" hint="Когда ребёнок отметит квест выполненным, он появится здесь" />
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl">{s.childAvatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">{s.questTitle}</div>
                    <div className="text-xs text-slate-500">
                      {s.childName} · {fmtDate(s.createdAt)}
                    </div>
                  </div>
                  {s.status === 'PENDING' && (
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      <Clock3 size={12} className="mr-1 inline" /> Ожидает
                    </span>
                  )}
                  {s.status === 'APPROVED' && (
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={12} className="mr-1 inline" /> Одобрено
                    </span>
                  )}
                  {s.status === 'REJECTED' && (
                    <span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                      <XCircle size={12} className="mr-1 inline" /> На доработку
                    </span>
                  )}
                </div>
                {s.comment && <p className="mt-2 text-sm text-slate-600">{s.comment}</p>}
                {s.photoUrl && (
                  <a
                    href={s.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    Фото доказательства
                  </a>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Награда:{' '}
                    {s.rewardAmount > 0 && s.currencyIcon ? `${s.currencyIcon} +${s.rewardAmount} ${s.currencyName ?? ''}` : ''}
                    {s.rewardAmount > 0 && s.xpReward > 0 ? ' · ' : ''}
                    {s.xpReward > 0 ? `+${s.xpReward} XP` : '—'}
                  </span>
                  {s.status === 'PENDING' && (
                    <span className="ml-auto flex gap-2">
                      <button
                        onClick={() => void approve(s.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={14} /> Принять
                      </button>
                      <button
                        onClick={() => void reject(s.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        <XCircle size={14} /> На доработку
                      </button>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Модалка квеста */}
      {modalOpen && (
      <Modal onClose={() => setModalOpen(false)} title={editing ? 'Редактировать квест' : 'Новый квест'}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Тип квеста</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Название</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Описание для принятия (этап «!»)
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              rows={2}
              value={form.basicDescription}
              onChange={(e) => setForm({ ...form, basicDescription: e.target.value })}
              placeholder="Что это за квест — ребёнок видит до того, как взять"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Описание выполнения (этап «?»)
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              rows={2}
              value={form.acceptDescription}
              onChange={(e) => setForm({ ...form, acceptDescription: e.target.value })}
              placeholder="Критерии сдачи — ребёнок видит после принятия"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Описание (общее)</label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Иконка</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Ребёнок (пусто — всем)
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.childId}
                onChange={(e) => setForm({ ...form, childId: e.target.value })}
              >
                <option value="">— всем детям —</option>
                {children.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.avatarEmoji} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Магазин награды</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.rewardStoreId}
                onChange={(e) => setForm({ ...form, rewardStoreId: e.target.value })}
              >
                <option value="">— без валюты —</option>
                {stores.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.currencyIcon} {s.name} ({s.currencyName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Сумма награды</label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.rewardAmount}
                onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })}
              />
            </div>
          </div>
          {form.type === 'SEASONAL' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Сезонный ивент</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.seasonalEventId}
                onChange={(e) => setForm({ ...form, seasonalEventId: e.target.value })}
              >
                <option value="">— выберите ивент —</option>
                {events.map((ev) => (
                  <option key={ev.id} value={String(ev.id)}>
                    {ev.tokenIcon} {ev.name} ({ev.tokenName})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Общий опыт (XP)</label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.xpReward}
                onChange={(e) => setForm({ ...form, xpReward: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.repeatable}
                  onChange={(e) => setForm({ ...form, repeatable: e.target.checked })}
                />
                Повторяемый (дейлик)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Активен
              </label>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Время на выполнение (мин)
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                placeholder="без таймера"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Перерыв между выполнениями (ч)
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.cooldownHours}
                onChange={(e) => setForm({ ...form, cooldownHours: e.target.value })}
                placeholder="0 — сразу доступен"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
            >
              Отмена
            </button>
            <button
              onClick={() => void saveQuest()}
              disabled={busy || !form.title.trim()}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {editing ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </Modal>
      )}
    </div>
  );
}
