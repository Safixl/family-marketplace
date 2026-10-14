import { useCallback, useEffect, useState } from 'react';
import { Award, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { AchievementDto, ChildDto, StoreDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

interface AchievementForm {
  name: string;
  description: string;
  icon: string;
  rewardAmount: string;
  targetType: string;
  targetValue: string;
  groupKey: string;
  skill: string;
  level: string;
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
  groupKey: '',
  skill: '',
  level: '0',
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
  { value: 'POINTS_EARNED', label: 'Накопить баллов (все магазины)', unit: 'баллов' },
  { value: 'MATH_STREAK', label: 'Решать задачи без пропусков (дней подряд)', unit: 'дней' },
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
      groupKey: achievement.groupKey ?? '',
      skill: achievement.skill ?? '',
      level: String(achievement.level ?? 0),
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
        groupKey: form.groupKey.trim() || null,
        skill: form.skill || null,
        level: Number(form.level || 0),
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
        <div className="space-y-4">
          {Object.entries(grouped).map(([key, group]) => {
            const sorted = [...group].sort((a, b) => a.level - b.level);
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
                          {sorted.length} уровней
                        </span>
                      )}
                    </div>
                    {sorted[0].description && (
                      <p className="text-sm text-slate-500">{sorted[0].description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {sorted.map((achievement) => {
                    const unit = TARGET_OPTIONS.find((o) => o.value === achievement.targetType)?.unit ?? '';
                    const store = stores.find((s) => s.id === achievement.rewardStoreId);
                    return (
                      <div
                        key={achievement.id}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
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
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(achievement)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                            title="Редактировать"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => void remove(achievement)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Удалить"
                          >
                            <Trash2 size={15} />
                          </button>
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
              </div>
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
            <div className="grid grid-cols-[64px_1fr] gap-3">
              <div>
                <label className="label">Иконка</label>
                <input
                  className="input text-center text-xl"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Название уровня</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Например, Железо"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="label">Описание</label>
              <textarea
                className="input min-h-[60px] resize-y"
                value={form.description}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Группа уровней (ключ, напр. reading-rang)</label>
                <input
                  className="input"
                  value={form.groupKey}
                  onChange={(e) => setForm({ ...form, groupKey: e.target.value })}
                  placeholder="пусто = одиночное достижение"
                />
              </div>
              <div>
                <label className="label">Номер уровня</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                />
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Уровни с одинаковым ключом группы образуют ранги (дерево → железо → бронза…). Награда за
              достигнутую цель начисляется автоматически, затем открывается следующий уровень. Ребёнок видит
              только ближайший уровень.
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