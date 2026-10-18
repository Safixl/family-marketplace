import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, CheckCircle2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '../../api/client';
import {
  ChildDto,
  ReadingBookDto,
  ReadingLogDto,
  ReadingRequestDto,
  ReadingSettingsDto,
  ReadingStatsDto,
  StoreDto,
} from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

interface BookForm {
  name: string;
  author: string;
  series: string;
  genre: string;
  pages: string;
  multiplier: string;
  active: boolean;
}

const EMPTY_BOOK: BookForm = { name: '', author: '', series: '', genre: '', pages: '', multiplier: '1', active: true };

interface Props {
  store: StoreDto;
  onClose: () => void;
}

export default function BooksManager({ store, onClose }: Props) {
  const [books, setBooks] = useState<ReadingBookDto[]>([]);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [childId, setChildId] = useState('');
  const [stats, setStats] = useState<ReadingStatsDto | null>(null);
  const [requests, setRequests] = useState<ReadingRequestDto[]>([]);
  const [readingSettings, setReadingSettings] = useState<ReadingSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [bookModal, setBookModal] = useState(false);
  const [editing, setEditing] = useState<ReadingBookDto | null>(null);
  const [form, setForm] = useState<BookForm>(EMPTY_BOOK);

  const [approveRequest, setApproveRequest] = useState<ReadingRequestDto | null>(null);
  const [requestForm, setRequestForm] = useState<BookForm>(EMPTY_BOOK);

  const loadBooks = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setBooks(await api.get<ReadingBookDto[]>(`/parent/children/${id}/books`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  const loadChildren = useCallback(async () => {
    try {
      const list = await api.get<ChildDto[]>('/parent/children');
      setChildren(list.filter((c) => c.active));
      if (list.length > 0 && !childId) {
        setChildId(String(list[0].id));
      }
    } catch (e) {
      alert(errMsg(e));
    }
  }, [childId]);

  const loadStats = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setStats(await api.get<ReadingStatsDto>(`/parent/children/${id}/reading`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  const loadReadingSettings = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setReadingSettings(await api.get<ReadingSettingsDto>(`/parent/children/${id}/reading-settings`));
    } catch {
      setReadingSettings(null);
    }
  }, []);

  const saveReadingSettings = async () => {
    if (!childId || !readingSettings) return;
    setBusy(true);
    try {
      await api.put(`/parent/children/${childId}/reading-settings`, {
        pagesTarget: readingSettings.pagesTarget,
        rewardAmount: readingSettings.rewardAmount,
        xpReward: readingSettings.xpReward,
      });
      alert('Настройки дейлика чтения сохранены');
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const loadRequests = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setRequests(await api.get<ReadingRequestDto[]>(`/parent/children/${id}/reading-requests`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadChildren();
      setLoading(false);
    })();
  }, [loadChildren]);

  useEffect(() => {
    if (!childId) return;
    void loadBooks(childId);
    void loadStats(childId);
    void loadRequests(childId);
    void loadReadingSettings(childId);
  }, [childId, loadBooks, loadStats, loadRequests, loadReadingSettings]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_BOOK);
    setBookModal(true);
  };

  const openEdit = (book: ReadingBookDto) => {
    setEditing(book);
    setForm({
      name: book.name,
      author: book.author ?? '',
      series: book.series ?? '',
      genre: book.genre ?? '',
      pages: String(book.pages),
      multiplier: String(book.multiplier),
      active: book.active,
    });
    setBookModal(true);
  };

  const saveBook = async () => {
    if (!form.name.trim()) {
      alert('Укажите название книги');
      return;
    }
    const pages = Number(form.pages);
    if (!Number.isFinite(pages) || pages < 0) {
      alert('Страниц должно быть неотрицательным числом');
      return;
    }
    const multiplier = Number(form.multiplier);
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      alert('Множитель должен быть неотрицательным числом');
      return;
    }
    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        author: form.author.trim() || null,
        series: form.series.trim() || null,
        genre: form.genre.trim() || null,
        pages,
        multiplier,
        active: form.active,
      };
      if (editing) {
        await api.put(`/parent/books/${editing.id}`, body);
      } else {
        await api.post(`/parent/stores/${store.id}/children/${childId}/books`, body);
      }
      setBookModal(false);
      await loadBooks(childId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const removeBook = async (book: ReadingBookDto) => {
    if (!window.confirm(`Удалить книгу «${book.name}»?`)) return;
    try {
      await api.del(`/parent/books/${book.id}`);
      await loadBooks(childId);
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const markRead = async (book: ReadingBookDto) => {
    if (!childId) {
      alert('Сначала выберите ребенка');
      return;
    }
    setBusy(true);
    try {
      await api.post('/parent/reading-logs', { childId: Number(childId), bookId: book.id });
      await loadStats(childId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const approveLog = async (log: ReadingLogDto) => {
    setBusy(true);
    try {
      await api.post(`/parent/reading-logs/${log.id}/approve`);
      await loadStats(childId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const rejectLog = async (log: ReadingLogDto) => {
    if (!window.confirm(`Отклонить отметку «${log.bookName}»?`)) return;
    try {
      await api.post(`/parent/reading-logs/${log.id}/reject`);
      await loadStats(childId);
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const openApproveRequest = (request: ReadingRequestDto) => {
    setApproveRequest(request);
    setRequestForm({ ...EMPTY_BOOK, name: request.title });
  };

  const saveApproveRequest = async () => {
    if (!approveRequest) return;
    if (!requestForm.name.trim()) {
      alert('Укажите название книги');
      return;
    }
    const pages = Number(requestForm.pages);
    if (!Number.isFinite(pages) || pages < 0) {
      alert('Страниц должно быть неотрицательным числом');
      return;
    }
    const multiplier = Number(requestForm.multiplier);
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      alert('Множитель должен быть неотрицательным числом');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/parent/reading-requests/${approveRequest.id}/approve`, {
        name: requestForm.name.trim(),
        author: requestForm.author.trim() || null,
        series: requestForm.series.trim() || null,
        genre: requestForm.genre.trim() || null,
        pages,
        multiplier,
      });
      setApproveRequest(null);
      await Promise.all([loadBooks(childId), loadRequests(childId)]);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const rejectRequest = async (request: ReadingRequestDto) => {
    if (!window.confirm(`Отклонить заявку «${request.title}»?`)) return;
    try {
      await api.post(`/parent/reading-requests/${request.id}/reject`);
      await loadRequests(childId);
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const pendingLogs = stats?.logs.filter((l) => l.status === 'PENDING') ?? [];
  const approvedIds = new Set(stats?.logs.filter((l) => l.status === 'APPROVED').map((l) => l.bookId) ?? []);
  const pendingIds = new Set(pendingLogs.map((l) => l.bookId));

  return (
    <Modal title={`📚 ${store.name} — книги и чтение`} onClose={onClose} wide>
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
          {stats && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="badge bg-indigo-100 text-indigo-700">Книг: {stats.booksRead}</span>
              <span className="badge bg-sky-100 text-sky-700">Страниц: {stats.pagesRead}</span>
              <span className="badge bg-emerald-100 text-emerald-700">
                Баллов: {fmtAmount(stats.pointsEarned)}
              </span>
              {stats.pendingCount > 0 && (
                <span className="badge bg-amber-100 text-amber-700">
                  Ждут подтверждения: {stats.pendingCount} ({fmtAmount(stats.pendingPoints)})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Дейлик чтения: настройки */}
        {readingSettings && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 text-sm font-bold text-slate-600">Дейлик чтения (страницы в день)</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Страниц в день</label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={readingSettings.pagesTarget}
                  onChange={(e) =>
                    setReadingSettings({ ...readingSettings, pagesTarget: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
              <div>
                <label className="label">Награда ({store.currencyIcon})</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="input"
                  value={readingSettings.rewardAmount}
                  onChange={(e) =>
                    setReadingSettings({ ...readingSettings, rewardAmount: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
              </div>
              <div>
                <label className="label">Опыт (XP)</label>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={readingSettings.xpReward}
                  onChange={(e) =>
                    setReadingSettings({ ...readingSettings, xpReward: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void saveReadingSettings()}>
                Сохранить настройки
              </button>
            </div>
          </div>
        )}

        {/* Заявки ребёнка */}
        {requests.filter((r) => r.status === 'PENDING').length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-600">Заявки ребёнка на книги</h3>
            <div className="space-y-2">
              {requests
                .filter((r) => r.status === 'PENDING')
                .map((request) => (
                  <div key={request.id} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{request.title}</div>
                      <div className="text-xs text-slate-500">
                        {request.childName} · {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => openApproveRequest(request)}>
                      <Check size={14} /> Принять
                    </button>
                    <button
                      className="btn-secondary !px-3 !py-1.5 text-xs"
                      onClick={() => void rejectRequest(request)}
                    >
                      <X size={14} /> Отклонить
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Список книг */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-600">Книги ребёнка ({books.length})</h3>
            <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={openCreate}>
              <Plus size={14} /> Добавить книгу
            </button>
          </div>
          {loading ? (
            <Spinner label="Загружаем книги…" />
          ) : books.length === 0 ? (
            <EmptyState title="Книг пока нет" hint="Добавьте книгу — ребёнок увидит её с множителем" />
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {books.map((book) => {
                const approved = approvedIds.has(book.id);
                const pending = pendingIds.has(book.id);
                return (
                  <div key={book.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <BookOpen size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {book.name}
                        {!book.active && <span className="ml-2 text-xs font-normal text-slate-400">(скрыта)</span>}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {[book.author, book.series, book.genre].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-slate-500">
                      <div>{book.pages} стр.</div>
                      <div className="font-semibold text-indigo-600">×{book.multiplier}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {approved ? (
                        <span className="badge bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={13} /> засчитана
                        </span>
                      ) : pending ? (
                        <span className="badge bg-amber-100 text-amber-700">ждёт подтверждения</span>
                      ) : (
                        <button
                          className="btn-primary !px-2.5 !py-1.5 text-xs"
                          disabled={busy || !childId}
                          onClick={() => void markRead(book)}
                        >
                          Засчитать
                        </button>
                      )}
                      <button
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                        onClick={() => openEdit(book)}
                        title="Редактировать"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => void removeBook(book)}
                        title="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ожидают подтверждения (отметил ребёнок) */}
        {pendingLogs.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-600">Ребёнок отметил «прочитал» — подтвердите</h3>
            <div className="space-y-2">
              {pendingLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{log.bookName}</div>
                    <div className="text-xs text-slate-500">
                      {log.pages} стр. × {log.multiplier} · {log.readAt}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-bold text-emerald-700">+{fmtAmount(log.points)}</div>
                  <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void approveLog(log)}>
                    <Check size={14} /> Подтвердить
                  </button>
                  <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => void rejectLog(log)}>
                    <X size={14} /> Отклонить
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* История чтения */}
        {stats && stats.logs.filter((l) => l.status === 'APPROVED').length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-600">Засчитанные книги</h3>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {stats.logs
                .filter((l) => l.status === 'APPROVED')
                .map((log) => (
                  <div key={log.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{log.bookName}</div>
                      <div className="text-xs text-slate-500">
                        {log.pages} стр. × {log.multiplier} · {log.readAt}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-bold text-emerald-700">+{fmtAmount(log.points)}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Модалка книги */}
      {bookModal && (
        <Modal title={editing ? 'Редактировать книгу' : 'Новая книга'} onClose={() => setBookModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Название</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Автор</label>
                <input className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div>
                <label className="label">Серия</label>
                <input className="input" value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Жанр</label>
                <input className="input" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
              </div>
              <div>
                <label className="label">Страниц</label>
                <input className="input" type="number" min="0" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
              </div>
              <div>
                <label className="label">Множитель</label>
                <input className="input" type="number" min="0" step="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Книга активна (видна ребенку)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setBookModal(false)}>Отмена</button>
              <button className="btn-primary" disabled={busy} onClick={() => void saveBook()}>Сохранить</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модалка принятия заявки */}
      {approveRequest && (
        <Modal title={`Принять заявку: ${approveRequest.title}`} onClose={() => setApproveRequest(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Заполните данные книги — она появится у ребёнка с множителем.
            </p>
            <div>
              <label className="label">Название</label>
              <input className="input" value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Автор</label>
                <input className="input" value={requestForm.author} onChange={(e) => setRequestForm({ ...requestForm, author: e.target.value })} />
              </div>
              <div>
                <label className="label">Жанр</label>
                <input className="input" value={requestForm.genre} onChange={(e) => setRequestForm({ ...requestForm, genre: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Страниц</label>
                <input className="input" type="number" min="0" value={requestForm.pages} onChange={(e) => setRequestForm({ ...requestForm, pages: e.target.value })} />
              </div>
              <div>
                <label className="label">Множитель</label>
                <input className="input" type="number" min="0" step="0.1" value={requestForm.multiplier} onChange={(e) => setRequestForm({ ...requestForm, multiplier: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setApproveRequest(null)}>Отмена</button>
              <button className="btn-primary" disabled={busy} onClick={() => void saveApproveRequest()}>Принять</button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}