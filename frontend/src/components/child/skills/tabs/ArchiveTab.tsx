import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SkillArchiveRow, SkillConfig } from '../../../../lib/skills';
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
                return (
                  <tr key={row.id}>
                    <td className="font-semibold text-amber-100">{row.title}</td>
                    <td className="text-stone-300">{row.author ?? '—'}</td>
                    <td className="text-stone-300">{row.genre ?? '—'}</td>
                    <td className="text-stone-300">{row.series ?? '—'}</td>
                    <td className="text-right text-stone-300">{row.pages ?? '—'}</td>
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
