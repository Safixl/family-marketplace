import { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../api/client';
import { MathBaseDifficulty, MathTopicDto } from '../../api/types';
import { errMsg } from '../../lib/format';
import Modal from '../Modal';
import { Spinner } from '../ui';

const BASE_LABELS: Record<MathBaseDifficulty, string> = {
  EASY: 'Легкий 🟢',
  MEDIUM: 'Средний ⚪',
  HIGH: 'Высокий 🔵',
  HARD: 'Сложный 🟣',
};

/**
 * Панель управления навыком «Математика» (родитель):
 * тумблеры тем с рекомендациями по классу + матрица базовой сложности
 * (потолок базового уровня — «Сложный», скрыт от ребёнка).
 */
export default function MathCardSettings({ onClose }: { onClose: () => void }) {
  const [topics, setTopics] = useState<MathTopicDto[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTopics(await api.get<MathTopicDto[]>('/parent/math-card-settings'));
    } catch (e) {
      setError(errMsg(e));
      setTopics([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (id: number, next: Partial<MathTopicDto>) => {
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
      await api.put('/parent/math-card-settings', { items });
      await load();
      onClose();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="🧮 Математика — генератор карточек" onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Включённые темы попадают в пул генерации ежедневных карточек. Базовый уровень сложности
          скрыт от ребёнка и смещает реальную сложность задач (потолок — «Сложный»).
        </p>
        {error && <div className="card text-sm text-rose-600">{error}</div>}
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
                    onChange={(e) => patch(t.id, { baseDifficulty: e.target.value as MathBaseDifficulty })}
                  >
                    {(Object.keys(BASE_LABELS) as MathBaseDifficulty[]).map((d) => (
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