import { useCallback, useEffect, useState } from 'react';
import { CalendarX2, Pencil, Play, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { SeasonalEventDto } from '../../api/types';
import { errMsg } from '../../lib/format';
import Modal from '../Modal';
import StoresTab from './StoresTab';
import { EmptyState, Spinner } from '../ui';

interface EventForm {
  name: string;
  description: string;
  tokenName: string;
  tokenIcon: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  keepAfterEnd: boolean;
}

const EMPTY_FORM: EventForm = {
  name: '',
  description: '',
  tokenName: 'жетон',
  tokenIcon: '🎟️',
  startsAt: '',
  endsAt: '',
  active: true,
  keepAfterEnd: false,
};

function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Сезонные ивенты: магазин открыт ограниченное время, валюта — сезонные жетоны.
 * Жетоны зарабатываются ТОЛЬКО через сезонные квесты ГМа (вкладка «Квесты»).
 * При создании ивента автоматически создаётся сезонный магазин с валютой-жетонами.
 *
 * После окончания:
 *  - без галочки «не удалять» ивент и магазин удаляются полностью;
 *  - с галочкой ивент остаётся у родителя, магазин скрыт от ребёнка до повторного запуска.
 */
export default function SeasonalTab() {
  const [events, setEvents] = useState<SeasonalEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SeasonalEventDto | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [storeEvent, setStoreEvent] = useState<SeasonalEventDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(await api.get<SeasonalEventDto[]>('/parent/seasonal-events'));
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
    setForm({ ...EMPTY_FORM, startsAt: isoDate(), endsAt: isoDate(7) });
    setModalOpen(true);
  };

  const openEdit = (ev: SeasonalEventDto) => {
    setEditing(ev);
    setForm({
      name: ev.name,
      description: ev.description ?? '',
      tokenName: ev.tokenName,
      tokenIcon: ev.tokenIcon,
      startsAt: ev.startsAt,
      endsAt: ev.endsAt,
      active: ev.active,
      keepAfterEnd: ev.keepAfterEnd,
    });
    setModalOpen(true);
  };

  const save = async () => {
    const body = {
      ...form,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    };
    try {
      if (editing) {
        await api.put(`/parent/seasonal-events/${editing.id}`, body);
      } else {
        await api.post('/parent/seasonal-events', body);
      }
      setModalOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  /** Повторный запуск завершённого ивента: сегодня → через 7 дней. */
  const restart = async (ev: SeasonalEventDto) => {
    try {
      await api.put(`/parent/seasonal-events/${ev.id}`, {
        name: ev.name,
        description: ev.description,
        tokenName: ev.tokenName,
        tokenIcon: ev.tokenIcon,
        startsAt: isoDate(),
        endsAt: isoDate(7),
        active: true,
        keepAfterEnd: ev.keepAfterEnd,
      });
      await load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить ивент и его магазин? Товары и квесты ивента будут удалены.')) return;
    try {
      await api.del(`/parent/seasonal-events/${id}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  if (loading) return <Spinner label="Загружаем ивенты…" />;

  const openNow = events.filter((e) => e.openNow).length;

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Сезонные ивенты</h2>
            <p className="text-sm text-slate-500">
              Магазины с жетонами на ограниченное время. Жетоны зарабатываются только через
              сезонные квесты ГМа. Сейчас открыто: {openNow}.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700"
          >
            <Plus size={16} /> Новый ивент
          </button>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="Ивентов пока нет"
            hint="Создайте «Зимнюю сказку» или «Хэллоуин» — появится магазин с жетонами (❄️/🎃)"
            icon={<CalendarX2 size={40} />}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map((ev) => (
              <div key={ev.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 text-xl">
                      {ev.tokenIcon}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">{ev.name}</div>
                      <div className="text-xs text-slate-500">
                        {ev.startsAt} → {ev.endsAt}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => void remove(ev.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Удалить ивент"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {ev.description && <p className="text-sm text-slate-500">{ev.description}</p>}

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-lg bg-fuchsia-50 px-2 py-1 text-fuchsia-700">
                    {ev.tokenIcon} {ev.tokenName}
                  </span>
                  {ev.openNow && (
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">открыт сейчас</span>
                  )}
                  {!ev.openNow && ev.keepAfterEnd && (
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700">
                      завершён · сохранён у родителя
                    </span>
                  )}
                  {!ev.openNow && !ev.keepAfterEnd && (
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-500">
                      {ev.active ? 'скоро/завершён' : 'выключен'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                  <button
                    onClick={() => setStoreEvent(ev)}
                    disabled={ev.storeId == null}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    <ShoppingBag size={14} /> Магазин
                  </button>
                  <button
                    onClick={() => openEdit(ev)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    <Pencil size={14} /> Изменить
                  </button>
                  {!ev.openNow && (
                    <button
                      onClick={() => void restart(ev)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <Play size={14} /> Запустить снова
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} title={editing ? 'Изменить ивент' : 'Новый сезонный ивент'}>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Название</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Описание</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Название жетонов</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={form.tokenName}
                  onChange={(e) => setForm({ ...form, tokenName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Иконка жетонов</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={form.tokenIcon}
                  onChange={(e) => setForm({ ...form, tokenIcon: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Начало</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Конец</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Активен
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={form.keepAfterEnd}
                  onChange={(e) => setForm({ ...form, keepAfterEnd: e.target.checked })}
                />
                <span>
                  Не удалять после окончания
                  <span className="block text-xs text-slate-400">
                    Ивент и магазин останутся у вас, но ребёнок их не увидит до повторного запуска.
                    Без галочки ивент, магазин и валюта удаляются полностью.
                  </span>
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Отмена
              </button>
              <button
                onClick={() => void save()}
                disabled={!form.name.trim() || !form.startsAt || !form.endsAt}
                className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-50"
              >
                {editing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {storeEvent && storeEvent.storeId != null && (
        <Modal
          title={`Магазин «${storeEvent.name}»`}
          onClose={() => setStoreEvent(null)}
          wide
        >
          <StoresTab storeId={storeEvent.storeId} title={`Магазин «${storeEvent.name}»`} />
        </Modal>
      )}
    </div>
  );
}
