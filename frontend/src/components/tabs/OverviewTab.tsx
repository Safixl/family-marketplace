import { useCallback, useEffect, useState } from 'react';
import { dailiesStatus } from '../child/rpg/DailiesStatus';
import { Check, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { CustomLimitInput, OverviewChildDto, QuestDto, SkillId } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { skillById } from '../../lib/skills';
import { skillLevelFromXp } from '../../lib/rpg';
import { EmptyState, Spinner } from '../ui';

const LIMIT_META: Record<string, { label: string; emoji: string }> = {
  TV: { label: 'Телевизор', emoji: '📺' },
  PC: { label: 'Компьютер', emoji: '💻' },
  CONSOLE: { label: 'Приставка', emoji: '🎮' },
  PHONE: { label: 'Телефон', emoji: '📱' },
  TABLET: { label: 'Планшет', emoji: '📟' },
};

/** Кастомные лимиты хранятся в слотах C1..C3. */
const CUSTOM_TYPE_RE = /^C[1-3]$/;
const isCustomType = (type: string) => CUSTOM_TYPE_RE.test(type);
const MAX_CUSTOM = 3;

/** Слоты шаблонов магазинов по кодам навыков (для включения навыка ребёнку). */
const SKILL_TEMPLATE_SLUG: Record<string, string> = {
  READING: 'reading',
  MATH: 'math',
  HOUSE: 'home',
  LOGIC: 'logic',
  LANG: 'lang',
  SPORT: 'sport',
};

function fmtDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h} ч ${m % 60} мин`;
  return `${m} мин`;
}

export default function OverviewTab({
  selectedChildId,
  onCreateQuest,
  onSkillsChanged,
}: {
  selectedChildId?: number | null;
  onCreateQuest?: (childId: number | null) => void;
  /** Вызывается после включения/выключения навыка тумблером. */
  onSkillsChanged?: () => void;
} = {}) {
  /** Навыки, переключаемые тумблером: skill → busy */
  const [skillBusy, setSkillBusy] = useState<Record<string, boolean>>({});

  const toggleSkill = (childId: number, skill: string, enabled: boolean) => {
    setSkillBusy((p) => ({ ...p, [skill]: true }));
    const runIt = async () => {
      if (enabled) {
        const slug = SKILL_TEMPLATE_SLUG[skill] ?? skill.toLowerCase();
        await api.post(`/parent/store-templates/${slug}/activate?childId=${childId}`);
      } else {
        await api.del(`/parent/skill-activations/${skill}/child/${childId}`);
      }
    };
    void runIt()
      .then(() => load())
      .then(() => onSkillsChanged?.())
      .catch((e) => alert(errMsg(e)))
      .finally(() => setSkillBusy((p) => ({ ...p, [skill]: false })));
  };
  const [children, setChildren] = useState<OverviewChildDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Инпуты произвольного изменения баллов: `childId:storeId` → строка-дельта */
  const [deltaInputs, setDeltaInputs] = useState<Record<string, string>>({});
  /** Инпуты лимитов (минут): `childId:type` → строка */
  const [limitInputs, setLimitInputs] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setChildren(await api.get<OverviewChildDto[]>('/parent/overview'));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const adjustBalance = (childId: number, storeId: number, delta: number) =>
    run(async () => {
      await api.post('/parent/balances/adjust', { childId, storeId, delta });
    });

  const applyCustomDelta = (child: OverviewChildDto, storeId: number) => {
    const key = `${child.id}:${storeId}`;
    const raw = deltaInputs[key]?.trim();
    const delta = Number(raw);
    if (!raw || !Number.isFinite(delta) || delta === 0) {
      alert('Введите ненулевое число');
      return;
    }
    void adjustBalance(child.id, storeId, delta).then(() => setDeltaInputs((p) => ({ ...p, [key]: '' })));
  };

  const saveLimit = (child: OverviewChildDto, type: string, field: 'tvMinutes' | 'pcMinutes' | 'consoleMinutes' | 'phoneMinutes' | 'tabletMinutes' | 'pocketWeekly') => {
    const key = `${child.id}:${type}`;
    const raw = limitInputs[key]?.trim();
    const value = Number(raw);
    if (!raw || !Number.isFinite(value) || value < 0) {
      alert('Введите неотрицательное число');
      return;
    }
    void run(async () => {
      await api.put(`/parent/children/${child.id}/limits`, { [field]: value });
    }).then(() => setLimitInputs((p) => ({ ...p, [key]: '' })));
  };

  const payOut = (child: OverviewChildDto) =>
    run(async () => {
      await api.post(`/parent/children/${child.id}/pocket/pay-out`);
    });

  /** Вкл/выкл стандартного лимита (переключатель в «Обзоре»). */
  const setLimitEnabled = (child: OverviewChildDto, type: string, enabled: boolean) =>
    run(async () => {
      const disabledTypes = child.limits.limits
        .filter((l) => !isCustomType(l.type))
        .filter((l) => (l.type === type ? !enabled : !l.enabled))
        .map((l) => l.type);
      await api.put(`/parent/children/${child.id}/limits`, { disabledTypes });
    });

  /** Сохранение полного списка кастомных лимитов ребёнка. */
  const saveCustomLimits = (child: OverviewChildDto, custom: CustomLimitInput[]) =>
    run(async () => {
      await api.put(`/parent/children/${child.id}/limits`, { customLimits: custom });
    });

  if (loading) return <Spinner label="Собираем обзор…" />;

  if (error) return <div className="card text-sm text-rose-600">{error}</div>;

  if (children.length === 0) {
    return (
      <EmptyState
        title="Пока нет детей"
        hint="Создайте ребёнка во вкладке «Дети», и здесь появится его карточка с лимитами, баллами и прогрессом"
      />
    );
  }

  /** Выбранный в шапке ребёнок: показываем только его профиль. */
  const visible = selectedChildId != null ? children.filter((c) => c.id === selectedChildId) : children;
  if (visible.length === 0) {
    return (
      <EmptyState
        title="Ребёнок не найден"
        hint="Возможно, профиль был удалён — выберите другого ребёнка в селекторе сверху"
      />
    );
  }

  return (
    <div className="space-y-6">
      {visible.map((child) => (
        <ChildCard
          key={child.id}
          child={child}
          busy={busy}
          deltaInputs={deltaInputs}
          limitInputs={limitInputs}
          setDeltaInputs={setDeltaInputs}
          setLimitInputs={setLimitInputs}
          onAdjust={adjustBalance}
          onApplyDelta={applyCustomDelta}
          onSaveLimit={saveLimit}
          onPayOut={payOut}
          onToggleLimit={setLimitEnabled}
          onSaveCustom={saveCustomLimits}
          onCreateQuest={onCreateQuest}
          onToggleSkill={toggleSkill}
          skillBusy={skillBusy}
        />
      ))}
    </div>
  );
}

// ---------- Карточка ребёнка ----------

function ChildCard({
  child,
  busy,
  deltaInputs,
  limitInputs,
  setDeltaInputs,
  setLimitInputs,
  onAdjust,
  onApplyDelta,
  onSaveLimit,
  onPayOut,
  onToggleLimit,
  onSaveCustom,
  onCreateQuest,
  onToggleSkill,
  skillBusy,
}: {
  child: OverviewChildDto;
  busy: boolean;
  deltaInputs: Record<string, string>;
  limitInputs: Record<string, string>;
  setDeltaInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setLimitInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAdjust: (childId: number, storeId: number, delta: number) => void;
  onApplyDelta: (child: OverviewChildDto, storeId: number) => void;
  onSaveLimit: (child: OverviewChildDto, type: string, field: 'tvMinutes' | 'pcMinutes' | 'consoleMinutes' | 'phoneMinutes' | 'tabletMinutes' | 'pocketWeekly') => void;
  onPayOut: (child: OverviewChildDto) => void;
  onToggleLimit: (child: OverviewChildDto, type: string, enabled: boolean) => void;
  onSaveCustom: (child: OverviewChildDto, custom: CustomLimitInput[]) => Promise<void>;
  onCreateQuest?: (childId: number | null) => void;
  onToggleSkill: (childId: number, skill: string, enabled: boolean) => void;
  skillBusy: Record<string, boolean>;
}) {
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');

  const customList: CustomLimitInput[] = child.limits.limits
    .filter((l) => isCustomType(l.type))
    .map((l) => ({ id: l.type, name: l.label ?? l.type, minutes: l.baseMinutes, enabled: l.enabled }));
  const levelPercent = Math.min(100, Math.round((child.level.ratio ?? 0) * 100));
  const questsDone = child.activeQuests.filter((q) => q.childStatus === 'SUBMITTED').length;
  const questsActive = child.activeQuests.filter((q) => q.childStatus === 'ACTIVE').length;
  const dailiesDone = child.dailies.filter((d) => d.completed).length;

  return (
    <section className="card space-y-4">
      {/* Шапка: аватар, имя, общий уровень */}
      <header className="flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-4xl">
          {child.avatarEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold">{child.name}</h2>
            {child.age != null && <span className="badge bg-slate-100 text-slate-500">{child.age} лет</span>}
            <span className="badge bg-indigo-50 text-indigo-700">
              {child.level.rankEmoji} {child.level.rank} · Ур. {child.level.level}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-slate-500">
              {child.level.xpInLevel}/{child.level.xpToNext} XP
            </span>
          </div>
          {child.activatedSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {child.activatedSkills.map((s) => {
                const meta = skillById(s as SkillId);
                return (
                  <span key={s} className="badge bg-emerald-50 text-emerald-700">
                    {meta?.icon ?? '⭐'} {meta?.name ?? s}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-2 text-center">
          <MiniStat label="Квесты в работе" value={questsActive} accent="text-amber-600" />
          <MiniStat label="Квесты на проверке" value={questsDone} accent="text-violet-600" />
          <MiniStat label="Дейлики (за день)" value={`${dailiesDone}/${child.dailies.length}`} accent="text-emerald-600" />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Балансы с редактированием */}
        <section className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-3 font-bold text-slate-700">💎 Баллы</h3>
          {child.balances.length === 0 ? (
            <p className="text-sm text-slate-400">Магазинов с активной валютой пока нет</p>
          ) : (
            <div className="space-y-2">
              {child.balances.map((b) => {
                const dKey = `${child.id}:${b.storeId}`;
                return (
                  <div key={b.storeId} className="flex flex-wrap items-center gap-2">
                    <span className="w-7 shrink-0 text-center text-lg">{b.currencyIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-700">{b.storeName}</div>
                      <div className="text-sm font-extrabold text-emerald-700">
                        {fmtAmount(b.amount, b.currencyName)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="btn-secondary !px-2 !py-1" disabled={busy} title="Списать 1" onClick={() => onAdjust(child.id, b.storeId, -1)}>
                        <Minus size={14} />
                      </button>
                      <button className="btn-secondary !px-2 !py-1" disabled={busy} title="Начислить 1" onClick={() => onAdjust(child.id, b.storeId, 1)}>
                        <Plus size={14} />
                      </button>
                      <input
                        className="input !w-16 !py-1 text-right"
                        type="number"
                        value={deltaInputs[dKey] ?? ''}
                        placeholder="±N"
                        onChange={(e) => setDeltaInputs((p) => ({ ...p, [dKey]: e.target.value }))}
                      />
                      <button
                        className="btn-secondary !px-2 !py-1"
                        disabled={busy}
                        title="Применить изменение"
                        onClick={() => onApplyDelta(child, b.storeId)}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Лимиты с редактированием */}
        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-700">⏱ Лимиты</h3>
            <button className="btn-secondary !px-3 !py-1 text-xs" disabled={busy} onClick={() => onPayOut(child)}>
              💰 Выдать карманные
            </button>
          </div>
          <div className="space-y-2">
            {child.limits.limits.map((l) => {
              const meta = isCustomType(l.type)
                ? { label: l.label ?? l.type, emoji: '🧩' }
                : LIMIT_META[l.type] ?? { label: l.type, emoji: '⏱' };
              const field = limitField(l.type);
              const lKey = `${child.id}:${l.type}`;
              const maxSeconds = Math.max(1, l.baseMinutes * 60 + l.extendedSeconds);
              const toggleLimit = () => {
                if (isCustomType(l.type)) {
                  void onSaveCustom(
                    child,
                    customList.map((c) => (c.id === l.type ? { ...c, enabled: !c.enabled } : c)),
                  );
                } else {
                  onToggleLimit(child, l.type, !l.enabled);
                }
              };
              const saveMinutes = () => {
                if (isCustomType(l.type)) {
                  const raw = limitInputs[lKey]?.trim();
                  const value = Number(raw);
                  if (!raw || !Number.isFinite(value) || value < 0) {
                    alert('Введите неотрицательное число');
                    return;
                  }
                  void onSaveCustom(
                    child,
                    customList.map((c) => (c.id === l.type ? { ...c, minutes: value } : c)),
                  ).then(() => setLimitInputs((p) => ({ ...p, [lKey]: '' })));
                } else {
                  onSaveLimit(child, l.type, field);
                }
              };
              return (
                <div key={l.type} className={`flex items-center gap-2 ${l.enabled ? '' : 'opacity-50'}`}>
                  <span className="w-6 shrink-0 text-center text-base">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-600">
                        {meta.label}
                        {!l.enabled ? ' · выключен' : ''}
                        {l.frozen ? ' ❄️' : ''}
                        {l.running ? ' ▶' : ''}
                      </span>
                      <span className="text-slate-500">
                        {l.enabled ? `осталось ${fmtDuration(l.remainingSeconds)} · ` : ''}
                        {l.baseMinutes} мин
                      </span>
                    </div>
                    {l.enabled ? (
                      <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${l.running ? 'bg-rose-400' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.min(100, Math.round((l.remainingSeconds / maxSeconds) * 100))}%` }}
                        />
                      </div>
                    ) : (
                      <div className="mt-0.5 h-2 rounded-full bg-slate-200" />
                    )}
                  </div>
                  {/* Переключатель вкл/выкл лимита */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={l.enabled}
                    disabled={busy}
                    onClick={toggleLimit}
                    title={l.enabled ? 'Выключить лимит (ребёнок его не увидит)' : 'Включить лимит'}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition ${l.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        l.enabled ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <input
                    className="input !w-16 !py-1 text-right"
                    type="number"
                    min="0"
                    value={limitInputs[lKey] ?? ''}
                    placeholder={`${l.baseMinutes}`}
                    onChange={(e) => setLimitInputs((p) => ({ ...p, [lKey]: e.target.value }))}
                  />
                  <button
                    className="btn-secondary !px-2 !py-1"
                    disabled={busy}
                    title="Сохранить лимит в минутах"
                    onClick={saveMinutes}
                  >
                    <Pencil size={13} />
                  </button>
                  {isCustomType(l.type) && (
                    <button
                      className="btn-secondary !px-2 !py-1 text-rose-600 hover:!bg-rose-50"
                      disabled={busy}
                      title="Удалить кастомный лимит"
                      onClick={() =>
                        void onSaveCustom(child, customList.filter((c) => c.id !== l.type))
                      }
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
            <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
              <span className="w-6 shrink-0 text-center">💰</span>
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-semibold text-slate-600">Карманные на неделю</span>
                <div className="text-slate-500">
                  {child.limits.pocket.remaining} ₽ осталось из {child.limits.pocket.weeklyLimit} ₽
                </div>
              </div>
              <input
                className="input !w-16 !py-1 text-right"
                type="number"
                min="0"
                value={limitInputs[`${child.id}:POCKET`] ?? ''}
                placeholder={`${child.limits.pocket.weeklyLimit}`}
                onChange={(e) => setLimitInputs((p) => ({ ...p, [`${child.id}:POCKET`]: e.target.value }))}
              />
              <button
                className="btn-secondary !px-2 !py-1"
                disabled={busy}
                title="Сохранить недельный лимит карманных"
                onClick={() => onSaveLimit(child, 'POCKET', 'pocketWeekly')}
              >
                <Pencil size={13} />
              </button>
            </div>

            {/* Кастомные лимиты: плюсик для добавления (до 3) */}
            {customList.length < MAX_CUSTOM && !addingCustom && (
              <button
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
                disabled={busy}
                onClick={() => {
                  setAddingCustom(true);
                  setCustomName('');
                  setCustomMinutes('');
                }}
              >
                <Plus size={13} /> Добавить свой лимит ({customList.length}/{MAX_CUSTOM})
              </button>
            )}
            {addingCustom && (
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <input
                  className="input w-full"
                  placeholder="Название лимита (напр. Лего)"
                  maxLength={40}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <input
                    className="input !w-24"
                    type="number"
                    min="0"
                    placeholder="мин/день"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                  />
                  <button
                    className="btn-primary !px-3 !py-1 text-xs"
                    disabled={busy}
                    onClick={() => {
                      const name = customName.trim();
                      if (!name) {
                        alert('Введите название лимита');
                        return;
                      }
                      const used = customList.map((c) => c.id);
                      const slot = ['C1', 'C2', 'C3'].find((s) => !used.includes(s));
                      if (!slot) {
                        alert('Максимум 3 кастомных лимита');
                        return;
                      }
                      void onSaveCustom(child, [
                        ...customList,
                        { id: slot, name, minutes: Math.max(0, Number(customMinutes) || 0), enabled: true },
                      ]).then(() => setAddingCustom(false));
                    }}
                  >
                    Добавить
                  </button>
                  <button className="btn-secondary !px-3 !py-1 text-xs" onClick={() => setAddingCustom(false)}>
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Активные квесты */}
        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-700">📜 Активные квесты</h3>
            {onCreateQuest && (
              <button
                className="btn-secondary !px-2 !py-1"
                disabled={busy}
                title={`Создать квест для ${child.name}`}
                onClick={() => onCreateQuest(child.id)}
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          {child.activeQuests.length === 0 ? (
            <p className="text-sm text-slate-400">Ребёнок пока не взял квесты</p>
          ) : (
            <ul className="space-y-2">
              {child.activeQuests.map((q) => (
                <QuestRow key={q.id} q={q} />
              ))}
            </ul>
          )}
        </section>

        {/* Дейлики и навыки: единый список — дейлик слева, прокачка по центру, тумблер справа */}
        <section className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-3 font-bold text-slate-700">📅 Дейлики и навыки</h3>
          <div className="space-y-2">
            {child.skills.length === 0 && (
              <p className="text-sm text-slate-400">Навыки ещё не подключены — включите их тумблером</p>
            )}
            {child.skills.map((s) => {
              const daily = child.dailies.find((d) => d.skill === s.skill);
              const status = daily ? dailiesStatus(daily) : null;
              const counterCls = !status
                ? 'text-slate-300'
                : status.kind === 'done-ok'
                  ? 'text-emerald-600'
                  : status.kind === 'done-fail'
                    ? 'text-rose-600'
                    : status.kind === 'mixed'
                      ? 'text-amber-600'
                      : 'text-sky-600';
              const enabled = !!daily;
              const lvl = skillLevelFromXp(s.xp);
              return (
                <div key={s.skill} className={`flex items-center gap-2 ${enabled ? '' : 'opacity-55'}`}>
                  {/* Слева: выполненные дейлики дня */}
                  <span
                    className={`w-16 shrink-0 text-right text-xs font-semibold ${counterCls}`}
                    title={status ? 'Дейлик на сегодня' : 'Навык выключен — дейликов нет'}
                  >
                    {status ? status.counter : '—'}
                  </span>
                  {/* Центр: название навыка и прокачка */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate font-semibold text-slate-600">
                        <span className="mr-1">{s.icon}</span>
                        {s.name}
                        {daily?.fullClear && <span className="ml-1 badge bg-indigo-50 text-indigo-700">100%</span>}
                        {status?.node}
                      </span>
                      <span className="shrink-0 text-slate-400">Ур. {lvl.level} · {s.xp} XP</span>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
                        style={{ width: `${Math.min(100, s.progress)}%` }}
                      />
                    </div>
                  </div>
                  {/* Справа: тумблер включения навыка */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    disabled={busy || !!skillBusy[s.skill]}
                    onClick={() => onToggleSkill(child.id, s.skill, !enabled)}
                    title={enabled ? 'Выключить навык (дейлики перестанут создаваться)' : 'Включить навык'}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                      skillBusy[s.skill] ? 'opacity-50' : ''
                    } ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        enabled ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className={`text-xl font-extrabold ${accent}`}>{value}</div>
      <div className="text-[11px] leading-tight text-slate-400">{label}</div>
    </div>
  );
}

function QuestRow({ q }: { q: QuestDto }) {
  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-lg">{q.icon || '📜'}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-700">{q.title}</div>
        <div className="text-xs text-slate-400">
          {q.currencyName ? `${fmtAmount(q.rewardAmount, q.currencyName)} · ` : ''}
          {q.xpReward > 0 ? `${q.xpReward} XP · ` : ''}
          {q.durationMinutes ? `${q.durationMinutes} мин` : 'без таймера'}
        </div>
      </div>
      {q.childStatus === 'SUBMITTED' ? (
        <span className="badge bg-violet-50 text-violet-700">на проверке</span>
      ) : (
        <span className="badge bg-amber-50 text-amber-700">в работе</span>
      )}
    </li>
  );
}

function limitField(type: string): 'tvMinutes' | 'pcMinutes' | 'consoleMinutes' | 'phoneMinutes' | 'tabletMinutes' {
  switch (type) {
    case 'TV':
      return 'tvMinutes';
    case 'PC':
      return 'pcMinutes';
    case 'CONSOLE':
      return 'consoleMinutes';
    case 'PHONE':
      return 'phoneMinutes';
    case 'TABLET':
      return 'tabletMinutes';
    default:
      return 'tvMinutes';
  }
}
