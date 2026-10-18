import { useCallback, useEffect, useState } from 'react';
import { Bell, Check, ShieldCheck, X } from 'lucide-react';
import { api } from '../api/client';
import type { NotificationDto } from '../api/types';

/** Кнопка-колокольчик с красным бейджем при наличии новых уведомлений. */
export function NotificationBell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-xl p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
      title="Уведомления"
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

interface Action {
  approve?: string;
  reject?: string;
}

/** Какое API-действие соответствует типу уведомления. */
function actionFor(n: NotificationDto): Action | null {
  if (n.status !== 'NEW' || n.refId == null) {
    return null;
  }
  const id = n.refId;
  switch (n.type) {
    case 'QUEST':
      return { approve: `/parent/quest-submissions/${id}/approve`, reject: `/parent/quest-submissions/${id}/reject` };
    case 'CARD_REVEAL':
    case 'CARD_HELP':
      return { approve: `/parent/task-card-requests/${id}/approve`, reject: `/parent/task-card-requests/${id}/reject` };
    case 'HOUSE_CHECK':
      return { approve: `/parent/house-check-requests/${id}/approve`, reject: `/parent/house-check-requests/${id}/reject` };
    case 'POCKET':
      return { approve: `/parent/pocket-requests/${id}/approve`, reject: `/parent/pocket-requests/${id}/reject` };
    case 'READING_DONE':
      return { approve: `/parent/reading-logs/${id}/approve`, reject: `/parent/reading-logs/${id}/reject` };
    case 'BOOK_REQUEST':
      return { approve: `/parent/reading-requests/${id}/approve`, reject: `/parent/reading-requests/${id}/reject` };
    default:
      return null;
  }
}

function iconFor(type: NotificationDto['type']): string {
  switch (type) {
    case 'QUEST':
      return '📜';
    case 'CARD_REVEAL':
      return '🃏';
    case 'CARD_HELP':
      return '🙋';
    case 'HOUSE_CHECK':
      return '🏠';
    case 'POCKET':
      return '💰';
    case 'READING_DONE':
      return '📖';
    case 'BOOK_REQUEST':
      return '📚';
    default:
      return '⏱';
  }
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Окно со всеми запросами ребёнка, требующими ответа родителя. */
export function NotificationPanel({
  open,
  onClose,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await api.get<NotificationDto[]>('/parent/notifications');
      setItems(list);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, load]);

  const act = async (n: NotificationDto, path: string) => {
    setBusyId(n.id);
    setError(null);
    try {
      await api.post(path);
      await load();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выполнить действие');
    } finally {
      setBusyId(null);
    }
  };

  const markDone = async (n: NotificationDto) => {
    setBusyId(n.id);
    setError(null);
    try {
      await api.post(`/parent/notifications/${n.id}/done`);
      await load();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выполнить действие');
    } finally {
      setBusyId(null);
    }
  };

  if (!open) return null;

  const newCount = items.filter((n) => n.status === 'NEW').length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-16 sm:justify-end sm:pr-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2 font-bold text-white">
            <Bell size={18} />
            Уведомления
            {newCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{newCount}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {error && <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
          {items.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-400">
              {newCount === 0 ? 'Всё спокойно — новых запросов нет' : 'Загрузка…'}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((n) => {
                const action = actionFor(n);
                const done = n.status === 'DONE';
                return (
                  <li key={n.id} className={`px-4 py-3 ${done ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                        {n.childAvatar || iconFor(n.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-800">
                            {n.childName ? `${n.childName} · ` : ''}
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-slate-400">{timeLabel(n.createdAt)}</span>
                        </div>
                        {n.payload && <p className="mt-0.5 text-xs text-slate-500">{n.payload}</p>}
                        {action && n.refId != null && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              disabled={busyId === n.id}
                              onClick={() => void act(n, action.approve!)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                            >
                              <Check size={14} /> Одобрить
                            </button>
                            <button
                              disabled={busyId === n.id}
                              onClick={() => void act(n, action.reject!)}
                              className="flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                            >
                              <X size={14} /> Отклонить
                            </button>
                          </div>
                        )}
                        {!action && n.refType === 'limit' && n.status === 'NEW' && (
                          <button
                            disabled={busyId === n.id}
                            onClick={() => void markDone(n)}
                            className="mt-2 flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-300 disabled:opacity-50"
                          >
                            <ShieldCheck size={14} /> Понятно
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}