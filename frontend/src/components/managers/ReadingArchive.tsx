import { useCallback, useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { api } from '../../api/client';
import { ChildDto, ReadingBookDto, ReadingLogDto, ReadingStatsDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

type ArchiveStatus = 'ALL' | 'read' | 'reading' | 'pending' | 'library';
type ArchiveSort = 'added' | 'read' | 'pages' | 'name';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  read: { label: '✅ Прочёл', cls: 'bg-emerald-100 text-emerald-700' },
  reading: { label: '📖 Читает', cls: 'bg-sky-100 text-sky-700' },
  pending: { label: '⏳ На проверке', cls: 'bg-amber-100 text-amber-700' },
  library: { label: '📚 В библиотеке', cls: 'bg-slate-100 text-slate-600' },
};

interface Row {
  book: ReadingBookDto;
  status: ArchiveStatus & keyof typeof STATUS_META;
  points: number;
  readAt: string | null;
}

/** Архив чтения ребёнка: книги (прочитанные и в процессе) с фильтрами по колонкам. */
export default function ReadingArchive() {
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [childId, setChildId] = useState('');
  const [books, setBooks] = useState<ReadingBookDto[] | null>(null);
  const [logs, setLogs] = useState<ReadingLogDto[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ArchiveStatus>('ALL');
  const [genre, setGenre] = useState('ALL');
  const [sort, setSort] = useState<ArchiveSort>('added');

  const loadChildren = useCallback(async () => {
    try {
      const list = await api.get<ChildDto[]>('/parent/children');
      const active = list.filter((c) => c.active);
      setChildren(active);
      if (active.length > 0) setChildId(String(active[0].id));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  const load = useCallback(async (id: string) => {
    if (!id) {
      setBooks(null);
      return;
    }
    try {
      const [b, stats] = await Promise.all([
        api.get<ReadingBookDto[]>(`/parent/children/${id}/books`),
        api.get<ReadingStatsDto>(`/parent/children/${id}/reading`),
      ]);
      setBooks(b);
      setLogs(stats.logs ?? []);
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    void load(childId);
  }, [childId, load]);

  const genres = Array.from(new Set((books ?? []).map((b) => b.genre).filter((g): g is string => !!g)));

  const rows: Row[] = (books ?? [])
    .map((book) => {
      const approved = logs.find((l) => l.bookId === book.id && l.status === 'APPROVED');
      const pending = logs.find((l) => l.bookId === book.id && l.status === 'PENDING');
      const page = book.currentPage ?? 0;
      const st: Row['status'] = approved
        ? 'read'
        : pending
          ? 'pending'
          : page > 0 && page < book.pages
            ? 'reading'
            : 'library';
      return { book, status: st, points: approved ? approved.points : 0, readAt: approved ? approved.readAt : null };
    })
    .filter((r) => {
      const q = query.trim().toLowerCase();
      if (q && !`${r.book.name} ${r.book.author ?? ''} ${r.book.series ?? ''}`.toLowerCase().includes(q)) return false;
      if (status !== 'ALL' && r.status !== status) return false;
      if (genre !== 'ALL' && (r.book.genre ?? '') !== genre) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'pages':
          return b.book.pages - a.book.pages;
        case 'name':
          return a.book.name.localeCompare(b.book.name, 'ru');
        case 'read':
          return (b.readAt ?? '').localeCompare(a.readAt ?? '');
        default:
          return b.book.createdAt.localeCompare(a.book.createdAt);
      }
    });

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Ребёнок</label>
          <select className="input" value={childId} onChange={(e) => setChildId(e.target.value)}>
            <option value="">— выберите —</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.avatarEmoji} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Поиск</label>
          <input
            className="input"
            placeholder="Название / автор / серия…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Статус</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as ArchiveStatus)}>
            <option value="ALL">Все</option>
            <option value="read">✅ Прочёл</option>
            <option value="reading">📖 Читает</option>
            <option value="pending">⏳ На проверке</option>
            <option value="library">📚 В библиотеке</option>
          </select>
        </div>
        <div>
          <label className="label">Жанр</label>
          <select className="input" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="ALL">Все жанры</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Сортировка</label>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value as ArchiveSort)}>
            <option value="added">По добавлению</option>
            <option value="read">По дате прочтения</option>
            <option value="pages">По страницам</option>
            <option value="name">По названию</option>
          </select>
        </div>
      </div>

      {books === null ? (
        <Spinner label="Загружаем архив…" />
      ) : books.length === 0 ? (
        <EmptyState title="Книг пока нет" hint="Добавьте книги ребёнку — они появятся в архиве" icon={<BookOpen size={36} />} />
      ) : rows.length === 0 ? (
        <EmptyState title="Ничего не найдено" hint="Измените фильтры" />
      ) : (
        <div className="max-h-[480px] overflow-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Название</th>
                <th className="px-3 py-2">Автор</th>
                <th className="px-3 py-2">Серия</th>
                <th className="px-3 py-2">Жанр</th>
                <th className="px-3 py-2">Страниц</th>
                <th className="px-3 py-2">Текущая</th>
                <th className="px-3 py-2">Статус</th>
                <th className="px-3 py-2">Баллы</th>
                <th className="px-3 py-2">Прочитана</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const meta = STATUS_META[r.status];
                return (
                  <tr key={r.book.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-800">{r.book.name}</td>
                    <td className="px-3 py-2 text-slate-600">{r.book.author ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{r.book.series ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{r.book.genre ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{r.book.pages}</td>
                    <td className="px-3 py-2 text-slate-600">{r.book.currentPage ?? 0}</td>
                    <td className="px-3 py-2">
                      <span className={`badge ${meta.cls}`}>{meta.label}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.points ? fmtAmount(r.points) : '—'}</td>
                    <td className="px-3 py-2 text-slate-500">
                      {r.readAt ? new Date(r.readAt).toLocaleDateString('ru-RU') : '—'}
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