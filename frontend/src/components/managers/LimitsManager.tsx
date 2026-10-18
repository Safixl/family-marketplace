import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Coins, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { ChildDto, ChildLimitsDto, PocketRequestDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import Modal from '../Modal';
import { Spinner } from '../ui';

interface Props {
  child: ChildDto;
  onClose: () => void;
}

const LIMIT_FIELDS: Array<{ key: keyof ChildLimitsDto; label: string; emoji: string }> = [
  { key: 'tvMinutes', label: 'Телевизор (мин/день)', emoji: '📺' },
  { key: 'pcMinutes', label: 'Компьютер (мин/день)', emoji: '💻' },
  { key: 'consoleMinutes', label: 'Игровая приставка (мин/день)', emoji: '🎮' },
  { key: 'phoneMinutes', label: 'Телефон (мин/день)', emoji: '📱' },
  { key: 'tabletMinutes', label: 'Планшет (мин/день)', emoji: '📟' },
];

/**
 * Родитель: настройка лимитов экрана ребёнка (минуты в день) и карманных денег
 * (рубли в неделю) + подтверждение запросов на выдачу карманных денег.
 */
export default function LimitsManager({ child, onClose }: Props) {
  const [limits, setLimits] = useState<ChildLimitsDto | null>(null);
  const [requests, setRequests] = useState<PocketRequestDto[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [l, r] = await Promise.all([
        api.get<ChildLimitsDto>(`/parent/children/${child.id}/limits`),
        api.get<PocketRequestDto[]>('/parent/pocket-requests'),
      ]);
      setLimits(l);
      setRequests(r.filter((x) => x.childId === child.id));
    } catch (e) {
      alert(errMsg(e));
    }
  }, [child.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!limits) return;
    setBusy(true);
    try {
      await api.put(`/parent/children/${child.id}/limits`, {
        tvMinutes: limits.tvMinutes,
        pcMinutes: limits.pcMinutes,
        consoleMinutes: limits.consoleMinutes,
        phoneMinutes: limits.phoneMinutes,
        tabletMinutes: limits.tabletMinutes,
        pocketWeekly: limits.pocketWeekly,
      });
      alert('Лимиты сохранены');
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const approve = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/pocket-requests/${id}/approve`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const reject = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/pocket-requests/${id}/reject`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (!limits) {
    return (
      <Modal title={`Лимиты · ${child.name}`} onClose={onClose}>
        <Spinner label="Загружаем лимиты…" />
      </Modal>
    );
  }

  return (
    <Modal title={`⏱ Лимиты · ${child.avatarEmoji} ${child.name}`} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {LIMIT_FIELDS.map((f) => (
            <label
              key={f.key}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="flex-1 text-sm font-medium text-slate-700">{f.label}</span>
              <input
                type="number"
                min={0}
                className="input w-24"
                value={limits[f.key]}
                onChange={(e) => setLimits({ ...limits, [f.key]: Math.max(0, Number(e.target.value) || 0) })}
              />
            </label>
          ))}
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-xl">💰</span>
            <span className="flex-1 text-sm font-medium text-slate-700">Карманные деньги (₽/неделю)</span>
            <input
              type="number"
              min={0}
              className="input w-24"
              value={limits.pocketWeekly}
              onChange={(e) => setLimits({ ...limits, pocketWeekly: Math.max(0, Number(e.target.value) || 0) })}
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={busy} onClick={() => void save()}>
            Сохранить лимиты
          </button>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600">
            <Coins size={16} className="text-amber-500" /> Запросы карманных денег
          </h3>
          {requests.length === 0 ? (
            <p className="text-sm text-slate-400">Запросов пока нет</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{fmtAmount(r.amount)} ₽</div>
                    <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString('ru-RU')}</div>
                  </div>
                  {r.status === 'PENDING' ? (
                    <div className="flex gap-1">
                      <button
                        className="btn-primary !px-3 !py-1.5 text-xs"
                        disabled={busy}
                        onClick={() => void approve(r.id)}
                      >
                        <CheckCircle2 size={14} /> Выдать
                      </button>
                      <button
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                        disabled={busy}
                        onClick={() => void reject(r.id)}
                      >
                        <XCircle size={14} /> Отклонить
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`badge ${r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                      {r.status === 'APPROVED' ? 'выдано' : 'отклонено'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}