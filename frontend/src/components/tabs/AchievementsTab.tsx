import { useCallback, useEffect, useState } from 'react';
import { Award, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { AchievementDto, ChildAchievementGroupDto, ChildDto, ReadingCatalogBookDto, StoreDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { tierForLevel } from '../../lib/achievementTiers';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

interface AchievementForm {
  name: string;
  description: string;
  icon: string;
  rewardAmount: string;
  targetType: string;
  targetValue: string;
  skill: string;
  hiddenReward: boolean;
  rewardStoreId: string;
}

const EMPTY_FORM: AchievementForm = {
  name: '',
  description: '',
  icon: '🏆',
  rewardAmount: '',
  targetType: 'NONE',
  targetValue: '',
  skill: '',
  hiddenReward: false,
  rewardStoreId: '',
};

const SKILL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: '— без направления —' },
  { value: 'MATH', label: '🧮 Математика' },
  { value: 'READING', label: '📚 Чтение' },
  { value: 'LOGIC', label: '🧩 Логика' },
  { value: 'LANG', label: '🌍 Иностранный язык' },
  { value: 'SPORT', label: '⚽ Спорт и хобби' },
  { value: 'HOUSE', label: '🏠 Порядок в комнате' },
];

const TARGET_OPTIONS: Array<{ value: string; label: string; unit: string }> = [
  { value: 'NONE', label: 'Без цели (выдаётся вручную)', unit: '' },
  { value: 'READING_BOOKS', label: 'Прочитать книг', unit: 'книг' },
  { value: 'READING_PAGES', label: 'Прочитать страниц', unit: 'страниц' },
  { value: 'MATH_TASKS', label: 'Решить задач', unit: 'задач' },
  { value: 'LOGIC_TASKS', label: 'Решить заданий логики', unit: 'задач' },
  { value: 'LANG_WORDS', label: 'Выучить иностранных слов', unit: 'слов' },
  { value: 'SPORT_DAYS', label: 'Активных дней (спорт/хобби)', unit: 'дней' },
  { value: 'POINTS_EARNED', label: 'Накопить баллов (все магазины)', unit: 'баллов' },
  { value: 'READING_STREAK', label: 'Читать без пропусков (дней подряд)', unit: 'дней' },
  { value: 'MATH_STREAK', label: 'Решать задачи без пропусков (дней подряд)', unit: 'дней' },
  { value: 'LOGIC_STREAK', label: 'Дейлики логики без пропусков (дней)', unit: 'дней' },
  { value: 'LANG_STREAK', label: 'Дейлики языка без пропусков (дней)', unit: 'дней' },
  { value: 'SPORT_STREAK', label: 'Активность без пропусков (дней)', unit: 'дней' },
  { value: 'HOUSE_CLEAN_STREAK', label: 'Порядок в комнате (дней подряд)', unit: 'дней' },
  { value: 'HOUSE_HELP_STREAK', label: 'Помощь по дому (дней подряд)', unit: 'дней' },
  { value: 'HOME_PURCHASES', label: 'Выкупить товаров в магазине Дом', unit: 'товаров' },
];

export default function AchievementsTab() {
  const [achievements, setAchievements] = useState<AchievementDto[]>([]);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AchievementDto | null>(null);
  const [form, setForm] = useState<AchievementForm>(EMPTY_FORM);

  const [grantFor, setGrantFor] = useState<AchievementDto | null>(null);
  const [grantChildId, setGrantChildId] = useState('');

  /** Ребёнок, для которого показываются статусы и прогресс. */
  const [viewChildId, setViewChildId] = useState('');
  /** Статусы достижений выбранного ребёнка (по groupKey). */
  const [childMeta, setChildMeta] = useState<ChildAchievementGroupDto[]>([]);
  const [skillFilter, setSkillFilter] = useState<'ALL' | 'READING' | 'MATH' | 'HOUSE' | 'NONE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DONE' | 'OPEN'>('ALL');
  /** Каталог прочитанных книг по ребёнку: childId → книги с read-статусом. */
  const [catalogByChild, setCatalogByChild] = useState<Record<string, ReadingCatalogBookDto[]>>({});

  const loadCatalog = useCallback(async (childId: string) => {
    if (!childId) return;
    try {
      const list = await api.get<ReadingCatalogBookDto[]>(`/parent/children/${childId}/reading-book-catalog`);
      setCatalogByChild((prev) => ({ ...prev, [childId]: list }));
    } catch {
      setCatalogByChild((prev) => ({ ...prev, [childId]: [] }));
    }
  }, []);

  const loadChildMeta = useCallback(async (childId: string) => {
    if (!childId) return;
    try {
      setChildMeta(await api.get<ChildAchievementGroupDto[]>(`/parent/achievements/children/${childId}`));
    } catch {
      setChildMeta([]);
    }
  }, []);

  useEffect(() => {
    void loadChildMeta(viewChildId);
    void loadCatalog(viewChildId);
  }, [viewChildId, loadChildMeta, loadCatalog]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, c, s] = await Promise.all([
        api.get<AchievementDto[]>('/parent/achievements'),
        api.get<ChildDto[]>('/parent/children'),
        api.get<StoreDto[]>('/parent/stores'),
      ]);
      setAchievements(a);
      setChildren(c);
      setStores(s);
      const firstChild = c.find((ch) => ch.active);
      if (firstChild && !viewChildId) {
        setViewChildId(String(firstChild.id));
      }
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

  const openEdit = (achievement: AchievementDto) => {
    setEditing(achievement);
    setForm({
      name: achievement.name,
      description: achievement.description ?? '',
      icon: achievement.icon,
      rewardAmount: String(achievement.rewardAmount),
      targetType: achievement.targetType ?? 'NONE',
      targetValue: achievement.targetValue ? String(achievement.targetValue) : '',
      skill: achievement.skill ?? '',
      hiddenReward: achievement.hiddenReward,
      rewardStoreId: achievement.rewardStoreId != null ? String(achievement.rewardStoreId) : '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      alert('Укажите название достижения');
      return;
    }
    const reward = form.rewardAmount.trim() ? Number(form.rewardAmount) : 0;
    if (!Number.isFinite(reward) || reward < 0) {
      alert('Награда должна быть неотрицательным числом');
      return;
    }
    setBusy(true);
    try {
      const targetValue = form.targetType === 'NONE' ? 0 : Number(form.targetValue || 0);
      if (form.targetType !== 'NONE' && (!Number.isFinite(targetValue) || targetValue <= 0)) {
        alert('Укажите цель больше нуля');
        return;
      }
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon: form.icon.trim() || '🏆',
        rewardAmount: reward,
        targetType: form.targetType,
        targetValue,
        skill: form.skill || null,
        hiddenReward: form.hiddenReward,
        rewardStoreId: form.rewardStoreId ? Number(form.rewardStoreId) : null,
      };
      if (editing) {
        await api.put(`/parent/achievements/${editing.id}`, body);
      } else {
        await api.post('/parent/achievements', body);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (achievement: AchievementDto) => {
    if (!window.confirm(`Удалить достижение «${achievement.name}»?`)) return;
    try {
      await api.del(`/parent/achievements/${achievement.id}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const addLevel = async (achievement: AchievementDto) => {
    setBusy(true);
    try {
      await api.post(`/parent/achievements/${achievement.id}/add-level`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const openGrant = (achievement: AchievementDto) => {
    setGrantFor(achievement);
    setGrantChildId('');
  };

  const grant = async () => {
    if (!grantFor) return;
    if (!grantChildId) {
      alert('Выберите ребенка');
      return;
    }
    setBusy(true);
    try {
      await api.post('/parent/achievements/grant', {
        childId: Number(grantChildId),
        achievementId: grantFor.id,
      });
      setGrantFor(null);
      alert('Достижение выдано!');
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Загружаем достижения…" />;

  if (error) return <div className="card text-sm text-rose-600">{error}</div>;

  const grouped: Record<string, AchievementDto[]> = {};
  achievements.forEach((a) => {
    const key = a.groupKey ?? `single-${a.id}`;
    (grouped[key] = grouped[key] ?? []).push(a);
  });

  /** Дефолтное (системное) достижение: нельзя удалять и менять параметры — только награду. */
  const isDefaultAchievement = (a: AchievementDto) =>
    (a.skill === 'READING' || a.skill === 'MATH') && a.groupKey != null;

  const defaultLocked = editing != null && isDefaultAchievement(editing);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-extrabold">Достижения</h1>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Layers size={14} /> Цель достигнута — награда начисляется автоматически
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> Создать
        </button>
      </div>

      {achievements.length === 0 ? (
        <EmptyState
          title="Достижений пока нет"
          hint="Создайте достижение с целью и наградой — ребёнок получит её автоматически"
        />
      ) : (
        <div className="space-y-5">
          {/* Фильтры: ребёнок / навык / статус */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input !w-auto"
              value={viewChildId}
              onChange={(e) => setViewChildId(e.target.value)}
            >
              {children
                .filter((c) => c.active)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.avatarEmoji} {c.name}
                  </option>
                ))}
            </select>
            <select
              className="input !w-auto"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value as 'ALL' | 'READING' | 'MATH' | 'HOUSE' | 'NONE')}
            >
              <option value="ALL">Все навыки</option>
              <option value="READING">📚 Чтение</option>
              <option value="MATH">🧮 Математика</option>
              <option value="HOUSE">🏠 Порядок в комнате</option>
              <option value="NONE">Без навыка</option>
            </select>
            <select
              className="input !w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'DONE' | 'OPEN')}
            >
              <option value="ALL">Любой статус</option>
              <option value="DONE">✅ Выполнено</option>
              <option value="OPEN">⏳ Не выполнено</option>
            </select>
          </div>

          {/* Секции по навыкам */}
          {(['READING', 'MATH', 'HOUSE', 'NONE'] as const).map((skill) => {
            if (skillFilter !== 'ALL' && skillFilter !== skill) return null;
            const skillGroups = Object.entries(grouped).filter(([, group]) => (group[0].skill ?? 'NONE') === skill);
            if (skillGroups.length === 0) return null;
            const skillLabel =
              skill === 'READING'
                ? '📚 Чтение'
                : skill === 'MATH'
                  ? '🧮 Математика'
                  : skill === 'HOUSE'
                    ? '🏠 Порядок в комнате'
                    : '🏅 Без навыка';
            return (
              <section key={skill}>
                <h2 className="mb-2 text-lg font-extrabold text-slate-700">{skillLabel}</h2>
                <div className="space-y-4">
                  {skillGroups.map(([key, group]) => {
                    const sorted = [...group].sort((a, b) => a.level - b.level);
                    const isQuest = sorted[0].groupKey != null && sorted[0].groupKey.startsWith('READING_QUEST_');
                    const meta = childMeta.find((m) => m.groupKey === sorted[0].groupKey);
                    const steps = sorted.length;
                    const doneSteps = meta
                      ? meta.completed
                        ? steps
                        : meta.unlocked
                          ? Math.max(1, Math.min(steps, meta.level))
                          : Math.max(0, Math.min(steps, Math.max(0, meta.level - 1)))
                      : 0;
                    const pct = steps > 0 ? Math.round((doneSteps / steps) * 100) : 0;
                    const completed = meta?.completed ?? false;
                    if (statusFilter === 'DONE' && !completed) return null;
                    if (statusFilter === 'OPEN' && completed) return null;
                    return (
                      <div key={key} className="card space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-2xl">
                            {sorted[0].icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold">
                              {sorted[0].name}
                              {sorted.length > 1 && (
                                <span className="badge ml-2 bg-indigo-100 text-indigo-700">
                                  {sorted.length} ступеней
                                </span>
                              )}
                              {isQuest && (
                                <span className="badge ml-2 bg-emerald-50 text-emerald-700">
                                  ✨ авто-выдача при полном чек-листе
                                </span>
                              )}
                            </div>
                            {!isQuest && sorted[0].description && (
                              <p className="text-sm text-slate-500">{sorted[0].description}</p>
                            )}
                          </div>
                          <div className="min-w-[140px] text-right">
                            {viewChildId && (
                              <>
                                <span
                                  className={`badge ${completed ? 'bg-emerald-100 text-emerald-700' : doneSteps > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}
                                >
                                  {completed ? '✅ выполнено' : doneSteps > 0 ? `🔓 ${doneSteps} из ${steps} ступеней` : '⏳ не начато'}
                                </span>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                  {sorted.map((achievement) => {
                    const unit = TARGET_OPTIONS.find((o) => o.value === achievement.targetType)?.unit ?? '';
                    const store = stores.find((s) => s.id === achievement.rewardStoreId);
                    const tier = tierForLevel(achievement.level);
                    const def = isDefaultAchievement(achievement);
                    return (
                      <div
                        key={achievement.id}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${tier.badge}`}>
                              {tier.emoji} {tier.name}
                            </span>
                            {achievement.targetType !== 'NONE'
                              ? `${achievement.name}: ${achievement.targetValue} ${unit}`
                              : achievement.name}
                            {achievement.skill && (
                              <span className="badge bg-violet-100 text-violet-700">
                                {SKILL_OPTIONS.find((s) => s.value === achievement.skill)?.label.replace(/^\S+\s/, '')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {achievement.hiddenReward && 'награда скрыта до достижения · '}
                            награда{' '}
                            {store
                              ? `${fmtAmount(achievement.rewardAmount)} в «${store.name}»`
                              : fmtAmount(achievement.rewardAmount)}
                            {def && <span className="badge ml-1 bg-slate-200 text-slate-500">дефолтное</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!def && (
                            <button
                              onClick={() => void addLevel(achievement)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                              title="Добавить следующий уровень"
                            >
                              <Plus size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(achievement)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                            title={def ? 'Изменить награду' : 'Редактировать'}
                          >
                            <Pencil size={15} />
                          </button>
                          {!def && (
                            <button
                              onClick={() => void remove(achievement)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Удалить"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                          {achievement.targetType === 'NONE' && (
                            <button
                              onClick={() => openGrant(achievement)}
                              className="btn-secondary !px-2.5 !py-1.5 text-xs"
                              title="Выдать вручную"
                            >
                              <Award size={13} /> Выдать
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Чек-лист серийных квестов: какие книги уже прочитаны ребёнком */}
                {isQuest && (
                  <QuestReadChecklist groupKey={sorted[0].groupKey ?? ''} catalog={catalogByChild[viewChildId] ?? []} />
                )}
              </div>
            );
          })}
        </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Модалка создания/редактирования */}
      {modalOpen && (
        <Modal
          title={editing ? 'Редактировать достижение' : 'Новое достижение'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <div className="space-y-4">
            {defaultLocked && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                🔒 Дефолтное достижение — изменить можно только награду (сумму, магазин, скрытую награду).
              </div>
            )}
            <div className="grid grid-cols-[64px_1fr] gap-3">
              <div>
                <label className="label">Иконка</label>
                <input
                  className="input text-center text-xl"
                  value={form.icon}
                  disabled={defaultLocked}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Название уровня</label>
                <input
                  className="input"
                  value={form.name}
                  disabled={defaultLocked}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Например, Железо"
                  autoFocus={!defaultLocked}
                />
              </div>
            </div>
            <div>
              <label className="label">Описание</label>
              <textarea
                className="input min-h-[60px] resize-y"
                value={form.description}
                disabled={defaultLocked}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="За что выдаём?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Направление (навык)</label>
                <select
                  className="input"
                  value={form.skill}
                  disabled={defaultLocked}
                  onChange={(e) => setForm({ ...form, skill: e.target.value })}
                >
                  {SKILL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Цель (прогресс для ребенка)</label>
                <select
                  className="input"
                  value={form.targetType}
                  disabled={defaultLocked}
                  onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                >
                  {TARGET_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {form.targetType !== 'NONE' && (
                <div>
                  <label className="label">
                    Сколько нужно ({TARGET_OPTIONS.find((o) => o.value === form.targetType)?.unit})
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={form.targetValue}
                    disabled={defaultLocked}
                    onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Награда (0 — без награды)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.rewardAmount}
                  onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Магазин для начисления награды</label>
                <select
                  className="input"
                  value={form.rewardStoreId}
                  onChange={(e) => setForm({ ...form, rewardStoreId: e.target.value })}
                >
                  <option value="">— без начисления —</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.currencyIcon} {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Нажми «+» на карточке достижения, чтобы добавить следующий уровень (Бронза → Серебро → Золото →
              Платина → Изумруд → Алмаз). Одиночные достижения — золотые. Награда за достигнутую цель
              начисляется автоматически, затем открывается следующий уровень.
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.hiddenReward}
                onChange={(e) => setForm({ ...form, hiddenReward: e.target.checked })}
              />
              Скрытая награда (видна ребёнку только после достижения цели)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                Отмена
              </button>
              <button className="btn-primary" disabled={busy} onClick={() => void save()}>
                Сохранить
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модалка ручной выдачи */}
      {grantFor && (
        <Modal title={`Выдать: ${grantFor.name}`} onClose={() => setGrantFor(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">Ребенок</label>
              <select
                className="input"
                value={grantChildId}
                onChange={(e) => setGrantChildId(e.target.value)}
              >
                <option value="">— выберите —</option>
                {children
                  .filter((c) => c.active)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.avatarEmoji} {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setGrantFor(null)}>
                Отмена
              </button>
              <button className="btn-primary" disabled={busy} onClick={() => void grant()}>
                <Award size={16} /> Выдать
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Чек-лист серийного квеста: какие книги серии уже прочитаны выбранным ребёнком. */
function QuestReadChecklist({ groupKey, catalog }: { groupKey: string; catalog: ReadingCatalogBookDto[] }) {
  const books = catalog.filter((b) => b.quest === groupKey);
  const readCount = books.filter((b) => b.read).length;
  const complete = books.length > 0 && readCount === books.length;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="mb-2">
        <span className="text-xs font-semibold text-slate-500">
          📋 Прочитанные книги серии
          {complete ? (
            <span className="ml-1 font-bold text-emerald-600">— серия завершена! ✅</span>
          ) : (
            <span className="ml-1">
              · {readCount}/{books.length}
            </span>
          )}
        </span>
      </div>
      {books.length === 0 ? (
        <p className="text-xs text-slate-400">Каталог книг не загружен</p>
      ) : (
        <ul className="grid gap-1 sm:grid-cols-2">
          {books.map((b) => (
            <li
              key={b.id}
              className={`flex items-center gap-2 text-xs ${b.read ? 'text-emerald-700' : 'text-slate-500'}`}
            >
              <span
                className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                  b.read
                    ? 'border-emerald-400 bg-emerald-100 text-emerald-600'
                    : 'border-slate-300 bg-white text-transparent'
                }`}
              >
                ✓
              </span>
              <span className={b.read ? 'font-medium' : ''}>{b.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}