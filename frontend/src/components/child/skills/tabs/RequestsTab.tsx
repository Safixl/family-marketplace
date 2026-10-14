import { useState } from 'react';
import { Clock3, Send } from 'lucide-react';
import { api } from '../../../../api/client';
import { StoreDto } from '../../../../api/types';
import { errMsg, fmtDate } from '../../../../lib/format';
import { SkillConfig, SkillRequestRow } from '../../../../lib/skills';
import { EmptyState } from '../../../ui';

interface Props {
  config: SkillConfig;
  store: StoreDto | null;
  requests: SkillRequestRow[];
  onReload: () => void;
}

const STATUS_META: Record<SkillRequestRow['status'], { label: string; cls: string }> = {
  PENDING: { label: 'Ожидает', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  APPROVED: { label: 'Одобрено', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  REJECTED: { label: 'Отказ', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export default function RequestsTab({ config, store, requests, onReload }: Props) {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = config.id === 'READING' && store != null;

  const submit = async () => {
    if (!title.trim()) {
      alert('Введите название');
      return;
    }
    if (!store) return;
    setBusy(true);
    try {
      await api.post(`/child/stores/${store.id}/reading-requests`, {
        title: title.trim(),
        link: link.trim() || null,
      });
      setTitle('');
      setLink('');
      onReload();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {canSubmit ? (
        <div className="rpg-panel space-y-3 p-4">
          <div className="text-sm font-bold text-amber-200">{config.requestTitle}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="rpg-input"
              placeholder={config.requestPlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="rpg-input"
              placeholder="Ссылка (необязательно)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <button className="rpg-btn" disabled={busy} onClick={() => void submit()}>
            <Send size={16} /> Отправить запрос
          </button>
        </div>
      ) : (
        <div className="rpg-panel p-4 text-sm text-stone-400">
          Запросы на добавление для этого навыка пока не подключены. Родитель может добавить материалы
          напрямую.
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyState title="Запросов пока нет" hint="Отправленные запросы появятся здесь" />
      ) : (
        <div className="rpg-panel overflow-x-auto">
          <table className="rpg-table w-full min-w-[480px]">
            <thead>
              <tr>
                <th>Название</th>
                <th>Ссылка</th>
                <th>Дата</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const meta = STATUS_META[r.status];
                return (
                  <tr key={r.id}>
                    <td className="font-semibold text-amber-100">{r.title}</td>
                    <td className="text-stone-300">
                      {r.link ? (
                        <a href={r.link} target="_blank" rel="noreferrer" className="text-sky-300 underline">
                          ссылка
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="text-stone-300">{fmtDate(r.createdAt)}</td>
                    <td>
                      <span className={`rpg-badge border ${meta.cls}`}>
                        {r.status === 'PENDING' && <Clock3 size={11} />}
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
