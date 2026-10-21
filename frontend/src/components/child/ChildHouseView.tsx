import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, Send, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { HouseDayDto, HouseMonthResponse } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { ROOM_RATINGS } from '../../lib/houseScale';
import { Spinner } from '../ui';

interface Props {
  storeId: number;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function ChildHouseView({ storeId }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const [data, setData] = useState<HouseMonthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [checkRequested, setCheckRequested] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ key: string; d?: HouseDayDto } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.get<HouseMonthResponse>(`/child/stores/${storeId}/house?month=${monthKey(cursor)}`));
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [cursor, storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const requestCheck = async () => {
    setBusy(true);
    try {
      await api.post(`/child/stores/${storeId}/house/check-request`);
      setCheckRequested(true);
      alert('Запрос на проверку комнаты отправлен родителю');
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const dayMap = new Map<string, HouseDayDto>();
  data?.days.forEach((d) => dayMap.set(d.day, d));

  const todayKey = dayKey(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
  const todayDay = dayMap.get(todayKey);
  const roomNotChecked = !todayDay || todayDay.roomScore <= 0;

  const cellClass = (d: HouseDayDto | undefined) => {
    if (!d || (d.roomScore === 0 && d.livingScore === 0)) {
      return 'bg-stone-800/60 text-stone-400';
    }
    if (d.points < 0) return 'bg-rose-500/20 text-rose-200';
    if (d.points > 0) return 'bg-emerald-500/20 text-emerald-200';
    return 'bg-amber-500/15 text-amber-200';
  };

  return (
    <div className="space-y-4">
      {/* Напоминалка: комната ещё не проверена сегодня */}
      {roomNotChecked && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          <span className="flex-1">🧹 Убери комнату! Проверка ещё не проводилась.</span>
          <button
            className="rpg-btn !px-3 !py-1.5 text-xs"
            disabled={busy || checkRequested}
            onClick={() => void requestCheck()}
          >
            <Send size={14} /> {checkRequested ? 'Запрос отправлен' : 'Попросить проверить'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <button className="btn-secondary !px-2.5 !py-2" onClick={() => setCursor(new Date(year, month - 2, 1))}>
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-[140px] text-center font-bold">
          {cursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </span>
        <button className="btn-secondary !px-2.5 !py-2" onClick={() => setCursor(new Date(year, month, 1))}>
          <ChevronRight size={18} />
        </button>
      </div>

      {data && (
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="badge bg-emerald-500/15 text-emerald-300">Комната «+»: {data.positiveRoomDays}</span>
          <span className="badge bg-sky-500/15 text-sky-300">Помощь «+»: {data.positiveLivingDays}</span>
          <span className="badge bg-rose-500/15 text-rose-300">Отрицательные: {data.negativeDays}</span>
          <span className="badge bg-indigo-500/15 text-indigo-300">
            <Sparkles size={13} /> Баллов: {fmtAmount(data.monthPoints)}
          </span>
          {data.pendingPoints !== 0 && (
            <span className="badge bg-amber-500/15 text-amber-300">
              <Clock3 size={13} /> Начислят 1-го числа: {fmtAmount(data.pendingPoints)}
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
              const isToday = key === todayKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay({ key, d })}
                  title={isToday && roomNotChecked ? 'Попросить проверить комнату' : 'Посмотреть день'}
                  className={`flex h-14 flex-col items-center justify-center rounded-xl text-sm font-semibold transition ${cellClass(d)} ${
                    isToday ? 'ring-2 ring-amber-400 ring-offset-1' : ''
                  } cursor-pointer hover:brightness-110`}
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
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {ROOM_RATINGS.map((r) => (
              <span key={r.value} className="badge bg-stone-800/80 text-stone-300" title={r.hint}>
                {r.icon} {r.label} ({r.value > 0 ? `+${r.value}` : r.value} 🧹)
              </span>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-stone-400">
            Нажмите на любой день, чтобы увидеть оценки и комментарий родителя. Баллы начисляются 1-го числа
            следующего месяца.
          </p>
        </div>
      )}

      {/* Просмотр дня: оценки и комментарий родителя */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedDay(null)}
        >
          <div className="rpg-panel w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-amber-100">📅 {selectedDay.key}</span>
              <button className="rpg-btn rpg-btn-ghost !px-2.5 !py-1 text-xs" onClick={() => setSelectedDay(null)}>
                Закрыть
              </button>
            </div>
            {!selectedDay.d || (selectedDay.d.roomScore === 0 && selectedDay.d.livingScore === 0) ? (
              <p className="text-sm text-stone-400">Оценка за этот день не выставлена — комментария пока нет.</p>
            ) : (
              <>
                <DayInfo label="Порядок в комнате">
                  {(() => {
                    const r = ROOM_RATINGS.find((x) => x.value === selectedDay.d!.roomScore);
                    return r ? (
                      <span className="text-sm text-amber-100">
                        {r.icon} {r.label} · {r.value > 0 ? `+${r.value}` : r.value} 🧹
                      </span>
                    ) : (
                      <span className="text-sm text-amber-100">{selectedDay.d!.roomScore} 🧹</span>
                    );
                  })()}
                </DayInfo>
                <DayInfo label="Помощь по дому">
                  <span className="text-sm text-amber-100">
                    {selectedDay.d.livingScore > 0 ? '+' : ''} {selectedDay.d.livingScore} 🧹
                  </span>
                </DayInfo>
                <DayInfo label="Баллы за день">
                  <span className={`text-sm font-bold ${selectedDay.d.points < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {selectedDay.d.points > 0 ? '+' : ''}
                    {selectedDay.d.points} 🧹
                    {!selectedDay.d.settled && ' · начислят 1-го числа'}
                  </span>
                </DayInfo>
                <div>
                  <div className="mb-1 text-xs font-semibold text-stone-400">💬 Комментарий родителя</div>
                  <p className="rounded-xl bg-stone-800/80 p-3 text-sm leading-relaxed text-stone-200">
                    {selectedDay.d.comment ?? 'Родитель не оставил комментарий'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DayInfo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold text-stone-400">{label}</span>
      {children}
    </div>
  );
}