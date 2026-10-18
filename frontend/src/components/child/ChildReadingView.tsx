import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Bookmark, CheckCircle2, Clock3, Coins, FileText, Plus } from 'lucide-react';
import { api } from '../../api/client';
import { ChildReadingResponse, StoreDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

interface Props {
  store: StoreDto;
}

export default function ChildReadingView({ store }: Props) {
  const [data, setData] = useState<ChildReadingResponse | null>(null);
  const [requestTitle, setRequestTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.get<ChildReadingResponse>('/child/reading'));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (bookId: number) => {
    setBusy(true);
    try {
      await api.post(`/child/books/${bookId}/read`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const saveBookmark = async (bookId: number, page: number) => {
    if (!page || page <= 0) {
      alert('Укажите страницу');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/child/books/${bookId}/bookmark`, { page });
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const submitRequest = async () => {
    if (!requestTitle.trim()) {
      alert('Введите название или ссылку на книгу');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/child/stores/${store.id}/reading-requests`, { title: requestTitle.trim() });
      setRequestTitle('');
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <Spinner label="Загружаем статистику чтения…" />;

  const { stats, books, requests } = data;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="theme-card flex items-center gap-3 rounded-2xl border p-4">
          <div className="theme-btn-soft flex h-11 w-11 items-center justify-center rounded-2xl">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold">{stats.booksRead}</div>
            <div className="theme-muted text-xs">книг засчитано</div>
          </div>
        </div>
        <div className="theme-card flex items-center gap-3 rounded-2xl border p-4">
          <div className="theme-btn-soft flex h-11 w-11 items-center justify-center rounded-2xl">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold">{stats.pagesRead}</div>
            <div className="theme-muted text-xs">страниц</div>
          </div>
        </div>
        <div className="theme-card flex items-center gap-3 rounded-2xl border p-4">
          <div className="theme-btn-soft flex h-11 w-11 items-center justify-center rounded-2xl">
            <Coins size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold">{fmtAmount(stats.pointsEarned)}</div>
            <div className="theme-muted text-xs">баллов заработано</div>
          </div>
        </div>
      </div>

      {stats.pendingCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700">
          <Clock3 size={16} />
          {stats.pendingCount} книг ждут подтверждения родителя ({fmtAmount(stats.pendingPoints)} баллов)
        </div>
      )}

      {/* Дейлик чтения: страницы за день */}
      <div className="theme-card rounded-2xl border p-4">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-bold">📖 Дейлик чтения</span>
          <span className="theme-muted">
            {data.pagesToday} из {data.pagesTarget} страниц
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
            style={{ width: `${data.pagesTarget > 0 ? Math.min(100, (data.pagesToday / data.pagesTarget) * 100) : 0}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Отмечай текущую страницу книги — разница между отметками засчитывается в дейлик.
        </p>
      </div>

      {/* Книги, рекомендованные родителем */}
      <div>
        <h3 className="theme-muted mb-2 text-sm font-bold">Книги от родителей</h3>
        {books.length === 0 ? (
          <EmptyState title="Книг пока нет" hint="Родитель добавит книги, а ты можешь предложить свою ниже" />
        ) : (
          <div className="space-y-2">
            {books.map((book) => {
              const currentPage = data.bookmarks[book.id];
              return (
                <div key={book.id} className="theme-card rounded-xl border px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <BookOpen size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{book.name}</div>
                      <div className="text-xs text-slate-500">
                        {book.author ? `${book.author} · ` : ''}
                        {book.pages} стр. · множитель ×{book.multiplier}
                        {currentPage != null && ` · сейчас на ${currentPage} стр.`}
                      </div>
                    </div>
                    {book.status === 'APPROVED' ? (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={13} /> засчитана
                      </span>
                    ) : book.status === 'PENDING' ? (
                      <span className="badge bg-amber-100 text-amber-700">
                        <Clock3 size={13} /> ждёт подтверждения
                      </span>
                    ) : (
                      <button
                        className="theme-btn rounded-xl px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={busy}
                        onClick={() => void markRead(book.id)}
                      >
                        Я прочитал
                      </button>
                    )}
                  </div>
                  {book.status !== 'APPROVED' && (
                    <div className="mt-2 flex items-center gap-2">
                      <Bookmark size={14} className="shrink-0 text-amber-500" />
                      <input
                        type="number"
                        min={1}
                        max={book.pages || undefined}
                        className="input w-24"
                        placeholder={currentPage != null ? String(currentPage) : 'стр.'}
                        defaultValue={currentPage ?? ''}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            void saveBookmark(book.id, Number((e.target as HTMLInputElement).value));
                          }
                        }}
                      />
                      <button
                        className="theme-btn rounded-xl px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={busy}
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement | null);
                          void saveBookmark(book.id, Number(input?.value));
                        }}
                      >
                        Сохранить страницу
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Заявки ребёнка */}
      <div>
        <h3 className="theme-muted mb-2 text-sm font-bold">Мои заявки на книги</h3>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Название или ссылка на книгу, которую читаю…"
            value={requestTitle}
            onChange={(e) => setRequestTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submitRequest();
            }}
          />
          <button className="theme-btn shrink-0 rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50" disabled={busy} onClick={() => void submitRequest()}>
            <Plus size={16} /> Предложить
          </button>
        </div>
        {requests.length > 0 && (
          <div className="mt-2 space-y-2">
            {requests.map((request) => (
              <div key={request.id} className="theme-card flex items-center gap-3 rounded-xl border px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{request.title}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                {request.status === 'PENDING' && (
                  <span className="badge bg-amber-100 text-amber-700">
                    <Clock3 size={13} /> ждёт ответа
                  </span>
                )}
                {request.status === 'APPROVED' && (
                  <span className="badge bg-emerald-100 text-emerald-700">принята</span>
                )}
                {request.status === 'REJECTED' && (
                  <span className="badge bg-rose-100 text-rose-700">отклонена</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}