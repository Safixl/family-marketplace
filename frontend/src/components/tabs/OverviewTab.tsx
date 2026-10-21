import { useCallback, useEffect, useState } from 'react';
import { Check, CheckCircle2, Minus, Pencil, Plus } from 'lucide-react';
import { api } from '../../api/client';
import { OverviewChildDto, QuestDto, SkillId, SkillProgressDto } from '../../api/types';
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

function fmtDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h} ч ${m % 60} мин`;
  return `${m} мин`;
}

export default function OverviewTab() {
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

  return (
    <div className="space-y-6">
      {children.map((child) => (
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
}) {
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
              const meta = LIMIT_META[l.type] ?? { label: l.type, emoji: '⏱' };
              const field = limitField(l.type);
              const lKey = `${child.id}:${l.type}`;
              return (
                <div key={l.type} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-center text-base">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-600">
                        {meta.label}
                        {l.frozen ? ' ❄️' : ''}
                        {l.running ? ' ▶' : ''}
                      </span>
                      <span className="text-slate-500">
                        осталось {fmtDuration(l.remainingSeconds)} · {l.baseMinutes} мин
                      </span>
                    </div>
                    <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${l.running ? 'bg-rose-400' : 'bg-emerald-400'}`}
                        style={{
                          width: `${Math.min(100, Math.round((l.remainingSeconds / Math.max(1, l.baseMinutes * 60 + l.extendedSeconds)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
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
                    onClick={() => onSaveLimit(child, l.type, field)}
                  >
                    <Pencil size={13} />
                  </button>
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
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Активные квесты */}
        <section className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-3 font-bold text-slate-700">📜 Активные квесты</h3>
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

        {/* Дейлики дня + навыки */}
        <section className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-3 font-bold text-slate-700">📅 Дейлики и навыки</h3>
          <div className="space-y-1.5">
            {child.dailies.length === 0 && (
              <p className="text-sm text-slate-400">Активные навыки для дейликов не подключены</p>
            )}
            {child.dailies.map((d) => {
              const meta = skillById(d.skill as SkillId);
              return (
                <div key={d.skill} className="flex items-center gap-2 text-sm">
                  <span className="w-6 shrink-0 text-center">{d.icon || meta?.icon}</span>
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-600">{d.name}</span>
                  <span className="text-xs text-slate-400">
                    {d.pointsEarned}/{d.pointsTarget}
                  </span>
                  {d.fullClear ? (
                    <span className="badge bg-indigo-50 text-indigo-700">Сделано на 100%</span>
                  ) : d.completed ? (
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                  ) : (
                    <span className="badge bg-slate-100 text-slate-400">не сделано</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            {child.skills.map((s) => (
              <SkillRow key={s.skill} s={s} />
            ))}
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

function SkillRow({ s }: { s: SkillProgressDto }) {
  const lvl = skillLevelFromXp(s.xp);
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-6 shrink-0 text-center">{s.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="truncate font-medium text-slate-600">{s.name}</span>
          <span className="shrink-0 text-slate-400">Ур. {lvl.level} · {s.xp} XP</span>
        </div>
        <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
            style={{ width: `${Math.min(100, s.progress)}%` }}
          />
        </div>
      </div>
    </div>
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
