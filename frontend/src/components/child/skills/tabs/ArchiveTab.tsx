import { useMemo, useState } from 'react';
import { Pencil, Search } from 'lucide-react';
import { api } from '../../../../api/client';
import { SkillArchiveRow, SkillConfig } from '../../../../lib/skills';
import { errMsg } from '../../../../lib/format';
import { EmptyState } from '../../../ui';

interface Props {
  config: SkillConfig;
  rows: SkillArchiveRow[];
}

const STATUS_META: Record<SkillArchiveRow['status'], { label: string; cls: string }> = {
  DONE: { label: 'Завершено', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  IN_PROGRESS: { label: 'Читаю сейчас', cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  PENDING: { label: 'Ждёт подтверждения', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
};

export default function ArchiveTab({ config, rows }: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | SkillArchiveRow['status']>('ALL');
  const [editId, setEditId] = useState<number | null>(null);
  const [editPage, setEditPage] = useState('');
  const [busy, setBusy] = useState(false);

  const savePage = async (row: SkillArchiveRow) => {
    const page = Number(editPage);
    if (!page || page <= 0) {
      alert('Укажите страницу');
      return;
    }
    if (row.pages && page > row.pages) {
      alert(`В книге всего ${row.pages} страниц`);
      return;
    }
    setBusy(true);
    try {
      await api.post(`/child/books/${row.id}/bookmark`, { page });
      setEditId(null);
      setEditPage('');
      window.location.reload();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== 'ALL' && r.status !== status) return false;
      if (!q) return true;
      return [r.title, r.author, r.genre, r.series, String(r.pages ?? '')]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-100/40" />
          <input
            className="rpg-input pl-9"
            placeholder="Поиск по названию, автору, жанру, серии…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(['ALL', 'DONE', 'IN_PROGRESS', 'PENDING'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rpg-tab ${status === s ? 'rpg-tab-active' : ''}`}
            >
              {s === 'ALL' ? 'Все' : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={rows.length === 0 ? config.archiveEmpty : 'Ничего не найдено'} hint="Попробуйте изменить поиск или фильтр" />
      ) : (
        <div className="rpg-panel overflow-x-auto">
          <table className="rpg-table w-full min-w-[560px]">
            <thead>
              <tr>
                <th>Название</th>
                <th>Автор</th>
                <th>Жанр</th>
                <th>Серия</th>
                <th className="text-right">Стр.</th>
                <th className="text-right">Баллы</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const meta = STATUS_META[row.status];
                const isReading = row.currentPage != null;
                return (
                  <tr key={row.id}>
                    <td className="font-semibold text-amber-100">{row.title}</td>
                    <td className="text-stone-300">{row.author ?? '—'}</td>
                    <td className="text-stone-300">{row.genre ?? '—'}</td>
                    <td className="text-stone-300">{row.series ?? '—'}</td>
                    <td className="text-right">
                      {isReading ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {editId === row.id ? (
                            <>
                              <input
                                type="number"
                                min={1}
                                max={row.pages}
                                className="rpg-input w-20"
                                value={editPage}
                                onChange={(e) => setEditPage(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') void savePage(row);
                                }}
                              />
                              <button
                                className="rpg-btn !px-2 !py-1 text-xs"
                                disabled={busy}
                                onClick={() => void savePage(row)}
                              >
                                ОК
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-sky-300">
                                {row.currentPage}/{row.pages}
                              </span>
                              <button
                                className="rounded-lg p-1 text-sky-300 hover:bg-sky-500/20"
                                onClick={() => {
                                  setEditId(row.id);
                                  setEditPage(String(row.currentPage ?? ''));
                                }}
                                title="Изменить страницу"
                              >
                                <Pencil size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-300">{row.pages ?? '—'}</span>
                      )}
                    </td>
                    <td className="text-right font-bold text-amber-300">+{row.points}</td>
                    <td>
                      <span className={`rpg-badge border ${meta.cls}`}>{meta.label}</span>
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
