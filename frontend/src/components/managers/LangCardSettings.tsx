import { useCallback, useEffect, useState } from 'react';
import { Check, Save, X } from 'lucide-react';
import { api } from '../../api/client';
import {
  LangCardReviewDto,
  LangCardSettingDto,
  LangDifficulty,
  LangParentVocabWord,
} from '../../api/types';
import { errMsg } from '../../lib/format';
import Modal from '../Modal';
import { Spinner } from '../ui';

const DIFF_LABELS: Record<LangDifficulty, string> = {
  EASY: 'Легкая 🟢',
  MEDIUM: 'Обычная ⚪',
  HARD: 'Сложная 🔴',
};

type Panel = 'tasks' | 'vocab' | 'reviews';

/**
 * Панель управления навыком «Иностранный язык» (родитель):
 * — время и сложность для каждого из 6 видов заданий;
 * — словарь: активация слов (до 50 одновременно), статус изучает/изучил;
 * — проверка ручных заданий с множителем 0/1/2.
 */
export default function LangCardSettings({ childId, onClose }: { childId?: number; onClose: () => void }) {
  const [panel, setPanel] = useState<Panel>('tasks');
  const [settings, setSettings] = useState<LangCardSettingDto[] | null>(null);
  const [vocab, setVocab] = useState<LangParentVocabWord[] | null>(null);
  const [reviews, setReviews] = useState<LangCardReviewDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const loadSettings = useCallback(async () => {
    try {
      setSettings(await api.get<LangCardSettingDto[]>('/parent/lang-card-settings'));
    } catch (e) {
      setError(errMsg(e));
      setSettings([]);
    }
  }, []);

  const loadVocab = useCallback(async () => {
    if (childId == null) {
      setVocab([]);
      return;
    }
    try {
      setVocab(await api.get<LangParentVocabWord[]>(`/parent/lang-vocab?childId=${childId}`));
    } catch {
      setVocab([]);
    }
  }, [childId]);

  const loadReviews = useCallback(async () => {
    try {
      setReviews(await api.get<LangCardReviewDto[]>('/parent/lang-card-reviews'));
    } catch {
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadVocab();
    void loadReviews();
  }, [loadSettings, loadVocab, loadReviews]);

  const patch = (taskType: string, next: Partial<LangCardSettingDto>) => {
    setSettings((prev) => (prev ?? []).map((s) => (s.taskType === taskType ? { ...s, ...next } : s)));
  };

  const save = async () => {
    if (!settings) return;
    setBusy(true);
    try {
      const items = settings.map((s) => ({
        taskType: s.taskType,
        minutes: s.minutes,
        difficulty: s.difficulty,
      }));
      await api.put('/parent/lang-card-settings', { items });
      await loadSettings();
      onClose();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const activate = async (wordId: number) => {
    if (childId == null) return;
    setBusy(true);
    try {
      await api.post(`/parent/lang-vocab/${wordId}/activate?childId=${childId}`);
      await loadVocab();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const markLearned = async (wordId: number) => {
    if (childId == null) return;
    setBusy(true);
    try {
      await api.post(`/parent/lang-vocab/${wordId}/mark-learned?childId=${childId}`);
      await loadVocab();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const review = async (cardId: number, multiplier: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/lang-card-reviews/${cardId}/review`, { multiplier });
      await loadReviews();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const activeCount = (vocab ?? []).filter((w) => w.status === 'ACTIVE').length;
  const filteredVocab = (vocab ?? []).filter(
    (w) => !filter || w.foreign.toLowerCase().includes(filter.toLowerCase()) || w.ru.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Modal title="🌍 Иностранный язык — управление навыком" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex gap-1.5">
          {([
            ['tasks', '⏱ Время и сложность'],
            ['vocab', `📖 Словарь (${activeCount}/50)`],
            ['reviews', `🔍 Проверка заданий${reviews.length ? ` (${reviews.length})` : ''}`],
          ] as Array<[Panel, string]>).map(([id, label]) => (
            <button key={id} onClick={() => setPanel(id)} className={`rpg-tab ${panel === id ? 'rpg-tab-active' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        {error && <div className="card text-sm text-rose-600">{error}</div>}

        {panel === 'tasks' && (
          settings === null ? (
            <Spinner label="Загружаем настройки…" />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                Для каждого вида заданий задаётся время на карточку и сложность — от сложности зависит,
                какие слова попадаются ребёнку (от самых нужных к более редким) и размер награды.
              </p>
              {settings.map((s) => (
                <div key={s.taskType} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800">
                      {s.emoji} {s.label} {s.manual && <span className="text-xs text-slate-400">· проверяет родитель</span>}
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500">
                    Мин:
                    <input
                      type="number"
                      min={5}
                      max={120}
                      className="input !w-20 text-right"
                      value={s.minutes}
                      onChange={(e) => patch(s.taskType, { minutes: Number(e.target.value) || s.minutes })}
                    />
                  </label>
                  <select
                    className="input !w-auto text-sm"
                    value={s.difficulty}
                    onChange={(e) => patch(s.taskType, { difficulty: e.target.value as LangDifficulty })}
                  >
                    {(Object.keys(DIFF_LABELS) as LangDifficulty[]).map((d) => (
                      <option key={d} value={d}>
                        {DIFF_LABELS[d]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="flex justify-end">
                <button className="btn-primary" onClick={save} disabled={busy || settings === null}>
                  <Save size={18} /> Сохранить
                </button>
              </div>
            </div>
          )
        )}

        {panel === 'vocab' && (
          childId == null ? (
            <div className="text-sm text-slate-500">Выберите ребёнка, чтобы управлять его словарём.</div>
          ) : vocab === null ? (
            <Spinner label="Загружаем словарь…" />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                Слова упорядочены от самых нужных к менее важным. Активированные слова появляются в заданиях.
                Слово считается изученным после 50 верных ответов подряд. Максимум 50 слов одновременно —
                новое активируется автоматически после изучения предыдущего.
              </p>
              <input
                className="input w-full"
                placeholder="Поиск слова…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <div className="max-h-96 space-y-1.5 overflow-y-auto">
                {filteredVocab.map((w) => (
                  <div
                    key={w.wordId}
                    className={`flex flex-wrap items-center gap-2 rounded-xl border p-2.5 text-sm ${
                      w.status === 'LEARNED'
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : w.status === 'ACTIVE'
                          ? 'border-sky-200 bg-sky-50/60'
                          : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-xs text-slate-400">#{w.sortOrder}</span>
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-800">{w.foreign}</span>
                      <span className="mx-2 text-slate-400">—</span>
                      <span className="text-slate-600">{w.ru}</span>
                    </span>
                    {w.status === 'ACTIVE' && (
                      <span className="text-xs text-sky-600">серия {w.streak}/{w.streakTarget}</span>
                    )}
                    {w.status === 'LEARNED' ? (
                      <span className="rpg-badge border border-emerald-300 bg-emerald-100 text-emerald-700">✅ Изучил</span>
                    ) : w.status === 'ACTIVE' ? (
                      <>
                        <span className="text-xs text-slate-400">изучает</span>
                        <button
                          className="btn-secondary !px-2.5 !py-1 text-xs"
                          disabled={busy}
                          onClick={() => void markLearned(w.wordId)}
                        >
                          Отметить «изучил»
                        </button>
                      </>
                    ) : (
                      <button className="btn-primary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => void activate(w.wordId)}>
                        Активировать
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {panel === 'reviews' && (
          reviews.length === 0 ? (
            <div className="text-sm text-slate-500">Ручных заданий на проверке нет. 👌</div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                Оцените задание: ×0 — отклонить, ×1 — зачесть, ×2 — зачесть с двойной наградой.
                Множитель применяется ко всем наградам задания.
              </p>
              {reviews.map((r) => (
                <div key={r.cardId} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl">{r.childAvatar}</span>
                    <span className="font-semibold text-slate-800">
                      {r.childName} · {r.taskTypeEmoji} {r.taskTypeLabel}
                    </span>
                    <span className="text-xs text-slate-400">базовая награда: {r.baseReward} XP</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {r.taskTexts.map((t, i) => (
                      <div key={i} className="rounded-xl bg-white p-2.5 text-sm">
                        <div className="whitespace-pre-line text-slate-700">{t}</div>
                        <div className="mt-1.5 whitespace-pre-line rounded-lg bg-slate-100 p-2 text-slate-800">
                          <span className="text-xs font-bold text-slate-400">ОТВЕТ РЕБЁНКА:</span>
                          <br />
                          {r.childAnswers[i] || <span className="italic text-slate-400">— нет ответа —</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 0)}>
                      <X size={14} /> ×0 Отклонить
                    </button>
                    <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 1)}>
                      <Check size={14} /> ×1 Зачесть
                    </button>
                    <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 2)}>
                      <Check size={14} /> ×2 Двойная награда
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
