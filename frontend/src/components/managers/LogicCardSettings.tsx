import { useCallback, useEffect, useState } from 'react';
import { Check, Save, X } from 'lucide-react';
import { api } from '../../api/client';
import { LogicBaseDifficulty, LogicCardApprovalDto, LogicTopicDto } from '../../api/types';
import { errMsg } from '../../lib/format';
import Modal from '../Modal';
import { Spinner } from '../ui';

const BASE_LABELS: Record<LogicBaseDifficulty, string> = {
  EASY: 'Легкий 🟢',
  MEDIUM: 'Средний ⚪',
  HIGH: 'Высокий 🔵',
  HARD: 'Сложный 🟣',
};

/**
 * Панель управления навыком «Логика» (родитель) — зеркало генератора карточек математики:
 * тумблеры тем с рекомендациями по классу + матрица базовой сложности
 * (потолок базового уровня — «Сложный», скрыт от ребёнка).
 */
export default function LogicCardSettings({ onClose }: { onClose: () => void }) {
  const [topics, setTopics] = useState<LogicTopicDto[] | null>(null);
  const [approvals, setApprovals] = useState<LogicCardApprovalDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    try {
      setApprovals(await api.get<LogicCardApprovalDto[]>('/parent/logic-card-approvals'));
    } catch {
      setApprovals([]);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setTopics(await api.get<LogicTopicDto[]>('/parent/logic-card-settings'));
    } catch (e) {
      setError(errMsg(e));
      setTopics([]);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadApprovals();
  }, [load, loadApprovals]);

  const decide = async (cardId: number, decision: 'approve' | 'reject') => {
    setBusy(true);
    try {
      await api.post(`/parent/logic-card-approvals/${cardId}/${decision}`);
      await loadApprovals();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const patch = (id: number, next: Partial<LogicTopicDto>) => {
    setTopics((prev) => (prev ?? []).map((t) => (t.id === id ? { ...t, ...next } : t)));
  };

  const save = async () => {
    if (!topics) return;
    setBusy(true);
    try {
      const items = topics.map((t) => ({
        topicId: t.id,
        active: t.active,
        baseDifficulty: t.baseDifficulty,
      }));
      await api.put('/parent/logic-card-settings', { items });
      await load();
      onClose();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="🧩 Логика — генератор карточек" onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Включённые темы попадают в пул генерации ежедневных логических карточек. Базовый уровень сложности
          скрыт от ребёнка и смещает реальную сложность задач (потолок — «Сложный»). Лимит — 3 карточки в день.
        </p>
        {error && <div className="card text-sm text-rose-600">{error}</div>}

        {approvals.length > 0 && (
          <div className="card space-y-2">
            <div className="font-bold text-slate-700">📋 Запросы на одобрение карточек</div>
            {approvals.map((a) => (
              <div key={a.cardId} className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="text-xl">{a.childAvatar}</span>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-semibold text-slate-800">
                    {a.childName} · {a.levelEmoji} {a.levelLabel}
                  </div>
                  <div className="text-xs text-slate-400">
                    {a.taskCount} задач · {a.minutes} мин · ⚡ +{a.xpReward} XP
                  </div>
                </div>
                <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void decide(a.cardId, 'approve')}>
                  <Check size={14} /> Одобрить
                </button>
                <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void decide(a.cardId, 'reject')}>
                  <X size={14} /> Отклонить
                </button>
              </div>
            ))}
          </div>
        )}
        {topics === null ? (
          <Spinner label="Загружаем темы…" />
        ) : (
          <div className="space-y-2">
            {topics.map((t) => (
              <div
                key={t.id}
                className={`rounded-2xl border p-3 transition ${t.active ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={t.active}
                    onClick={() => patch(t.id, { active: !t.active })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${t.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${t.active ? 'left-[22px]' : 'left-0.5'}`}
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-400">Рекомендовано: {t.gradeLabel}</div>
                  </div>
                  <select
                    className="input !w-auto text-sm"
                    value={t.baseDifficulty}
                    disabled={!t.active}
                    onChange={(e) => patch(t.id, { baseDifficulty: e.target.value as LogicBaseDifficulty })}
                  >
                    {(Object.keys(BASE_LABELS) as LogicBaseDifficulty[]).map((d) => (
                      <option key={d} value={d}>
                        {BASE_LABELS[d]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <button className="btn-primary" onClick={save} disabled={busy || topics === null}>
            <Save size={18} /> Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
}
