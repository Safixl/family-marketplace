import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Sparkles, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { ChildDto, HouseCheckRequestDto, HouseDayDto, HouseMonthResponse, StoreDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import Modal from '../Modal';
import { Spinner } from '../ui';

interface Props {
  store: StoreDto;
  onClose: () => void;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const ROOM_OPTIONS = [-2, -1, 0, 1, 2];
const LIVING_OPTIONS = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function HouseCalendar({ store, onClose }: Props) {
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [childId, setChildId] = useState('');
  const [cursor, setCursor] = useState(() => new Date());
  const [data, setData] = useState<HouseMonthResponse | null>(null);
  const [checkRequests, setCheckRequests] = useState<HouseCheckRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editDay, setEditDay] = useState<string | null>(null);
  const [roomScore, setRoomScore] = useState(0);
  const [livingScore, setLivingScore] = useState(0);

  const loadChildren = useCallback(async () => {
    try {
      const list = await api.get<ChildDto[]>('/parent/children');
      const active = list.filter((c) => c.active);
      setChildren(active);
      if (active.length > 0 && !childId) {
        setChildId(String(active[0].id));
      }
    } catch (e) {
      alert(errMsg(e));
    }
  }, [childId]);

  const loadMonth = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const month = monthKey(cursor);
      setData(await api.get<HouseMonthResponse>(`/parent/stores/${store.id}/house?childId=${childId}&month=${month}`));
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [childId, cursor, store.id]);

  const loadCheckRequests = useCallback(async () => {
    try {
      setCheckRequests(await api.get<HouseCheckRequestDto[]>('/parent/house-check-requests'));
    } catch {
      setCheckRequests([]);
    }
  }, []);

  useEffect(() => {
    void loadChildren();
    void loadCheckRequests();
  }, [loadChildren, loadCheckRequests]);

  useEffect(() => {
    void loadMonth();
  }, [loadMonth]);

  const approveCheck = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/house-check-requests/${id}/approve`);
      await Promise.all([loadCheckRequests(), loadMonth()]);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const rejectCheck = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/house-check-requests/${id}/reject`);
      await loadCheckRequests();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const dayMap = new Map<string, HouseDayDto>();
  data?.days.forEach((d) => dayMap.set(d.day, d));

  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const today = new Date();
  const todayKey = dayKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const openDay = (day: number) => {
    const key = dayKey(year, month, day);
    if (key > todayKey) {
      alert('Нельзя проставить баллы за ещё не наступившую дату');
      return;
    }
    const existing = dayMap.get(key);
    setRoomScore(existing?.roomScore ?? 0);
    setLivingScore(existing?.livingScore ?? 0);
    setEditDay(key);
  };

  const saveDay = async () => {
    if (!editDay || !childId) return;
    setBusy(true);
    try {
      await api.put(`/parent/stores/${store.id}/house-days`, {
        childId: Number(childId),
        day: editDay,
        roomScore,
        livingScore,
      });
      setEditDay(null);
      await loadMonth();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const shiftMonth = (delta: number) => {
    setCursor(new Date(year, month - 1 + delta, 1));
  };

  const cellClass = (d: HouseDayDto | undefined) => {
    if (!d || (d.roomScore === 0 && d.livingScore === 0)) {
      return 'bg-slate-50 text-slate-400 hover:bg-slate-100';
    }
    if (d.points < 0) return 'bg-rose-100 text-rose-700 hover:bg-rose-200';
    if (d.points > 0) return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
    return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
  };

  return (
    <Modal title={`🏠 ${store.name} — календарь домашних дел`} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="label">Ребенок</label>
            <select className="input" value={childId} onChange={(e) => setChildId(e.target.value)}>
              <option value="">— выберите —</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.avatarEmoji} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary !px-2.5 !py-2" onClick={() => shiftMonth(-1)}>
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[140px] text-center font-bold">
              {cursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </span>
            <button className="btn-secondary !px-2.5 !py-2" onClick={() => shiftMonth(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Запросы проверки комнаты */}
        {checkRequests.filter((r) => r.status === 'PENDING').length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-600">Запросы на проверку комнаты</h3>
            <div className="space-y-2">
              {checkRequests
                .filter((r) => r.status === 'PENDING')
                .map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <span className="text-xl">{r.childAvatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{r.childName}</div>
                      <div className="text-xs text-slate-500">
                        просит проверить комнату · {new Date(r.day).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void approveCheck(r.id)}>
                      <CheckCircle2 size={14} /> Комната убрана
                    </button>
                    <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void rejectCheck(r.id)}>
                      <XCircle size={14} /> Отклонить
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {data && (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="badge bg-emerald-100 text-emerald-700">Комната «+»: {data.positiveRoomDays}</span>
            <span className="badge bg-sky-100 text-sky-700">Помощь «+»: {data.positiveLivingDays}</span>
            <span className="badge bg-rose-100 text-rose-700">Отрицательные: {data.negativeDays}</span>
            <span className="badge bg-indigo-100 text-indigo-700">
              <Sparkles size={13} /> Баллов за месяц: {fmtAmount(data.monthPoints)}
            </span>
            {data.pendingPoints !== 0 && (
              <span className="badge bg-amber-100 text-amber-700">
                <Clock3 size={13} /> Ожидают начисления: {fmtAmount(data.pendingPoints)}
              </span>
            )}
          </div>
        )}

        {loading ? (
          <Spinner label="Загружаем календарь…" />
        ) : (
          <div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
              {WEEKDAYS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = dayKey(year, month, day);
                const d = dayMap.get(key);
                const isFuture = key > todayKey;
                return (
                  <button
                    key={key}
                    onClick={() => openDay(day)}
                    disabled={isFuture}
                    className={`flex h-14 flex-col items-center justify-center rounded-xl text-sm font-semibold transition ${
                      isFuture ? 'cursor-not-allowed bg-slate-50 text-slate-300' : cellClass(d)
                    }`}
                    title={isFuture ? 'Будущая дата' : 'Отметить день'}
                  >
                    <span>{day}</span>
                    {d && (d.roomScore !== 0 || d.livingScore !== 0) && (
                      <span className="text-[10px] font-bold">
                        {d.points > 0 ? `+${d.points}` : d.points}
                        {!d.settled && <span className="text-amber-500">*</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Нажмите на день, чтобы проставить оценки. Комната: от −2 до +2, помощь по дому: от −3 до +6.
              Баллы начисляются автоматически 1-го числа следующего месяца (звёздочка * — ожидает начисления).
            </p>
          </div>
        )}
      </div>

      {editDay && (
        <Modal title={`Оценка за ${editDay}`} onClose={() => setEditDay(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">Комната (от −2 до +2)</label>
              <div className="flex flex-wrap gap-1.5">
                {ROOM_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setRoomScore(v)}
                    className={`h-10 flex-1 rounded-xl text-sm font-bold transition ${
                      roomScore === v
                        ? v < 0
                          ? 'bg-rose-500 text-white'
                          : v > 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {v > 0 ? `+${v}` : v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Помощь по дому (от −3 до +6)</label>
              <div className="flex flex-wrap gap-1.5">
                {LIVING_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setLivingScore(v)}
                    className={`h-10 flex-1 rounded-xl text-sm font-bold transition ${
                      livingScore === v
                        ? v < 0
                          ? 'bg-rose-500 text-white'
                          : v > 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {v > 0 ? `+${v}` : v}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              Итого за день: {roomScore + livingScore > 0 ? '+' : ''}
              {roomScore + livingScore} баллов (начислятся 1-го числа следующего месяца)
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setEditDay(null)}>Отмена</button>
              <button className="btn-primary" disabled={busy} onClick={() => void saveDay()}>Сохранить</button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}