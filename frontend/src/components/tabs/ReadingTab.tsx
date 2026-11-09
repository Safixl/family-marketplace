import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Library,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../../api/client';
import {
  ProductDto,
  ReadingBookDto,
  ReadingCatalogBookDto,
  ReadingLogDto,
  ReadingRequestDto,
  ReadingSettingsDto,
  ReadingStatsDto,
  StoreDto,
} from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

// ---------- Формы ----------

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

/** Жанры достижений чтения (выпадающий список). */
const GENRES = [
  'Фэнтези',
  'Научная фантастика',
  'Детектив',
  'Приключения',
  'Современная проза',
  'Исторические романы',
  'Ужасы и мистика',
  'Научпоп и энциклопедии',
  'Сказки, мифы и легенды',
  'Поэзия',
  'Комиксы и манга',
  'Юмор',
];

/** Режим добавления книги: выбор источника, каталог достижений или ручное заполнение. */
type BookMode = 'choose' | 'catalog' | 'custom';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  limitPerChild: string;
  active: boolean;
  effectType: string;
  effectLimit: string;
  effectValue: string;
}

interface StoreForm {
  name: string;
  description: string;
  currencyName: string;
  currencyIcon: string;
  active: boolean;
}

const EMPTY_PRODUCT: ProductForm = {
  name: '',
  description: '',
  price: '',
  limitPerChild: '',
  active: true,
  effectType: 'NONE',
  effectLimit: '',
  effectValue: '',
};

const ARCHIVE_STATUS: Record<string, { label: string; cls: string }> = {
  read: { label: '✅ Прочитана', cls: 'bg-emerald-100 text-emerald-700' },
  reading: { label: '📖 Читает', cls: 'bg-sky-100 text-sky-700' },
  pending: { label: '⏳ На проверке', cls: 'bg-amber-100 text-amber-700' },
  library: { label: '📚 В библиотеке', cls: 'bg-slate-100 text-slate-600' },
};

interface Props {
  /** Ребёнок, выбранный в шапке дашборда — чей архив/дейлик показываем. */
  selectedChildId?: number | null;
}

/**
 * Вкладка «Чтение» навыка: статистика, дейлик по страницам, архив книг,
 * магазин навыка (товары с CRUD) и FAB добавления книги.
 * Всё живёт на одном экране — без вложенных «магазинов внутри вкладки».
 */
export default function ReadingTab({ selectedChildId }: Props) {
  // Базовые данные
  const [store, setStore] = useState<StoreDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Данные чтения выбранного ребёнка
  const [books, setBooks] = useState<ReadingBookDto[]>([]);
  const [stats, setStats] = useState<ReadingStatsDto | null>(null);
  const [requests, setRequests] = useState<ReadingRequestDto[]>([]);
  const [readingSettings, setReadingSettings] = useState<ReadingSettingsDto | null>(null);
  const [catalog, setCatalog] = useState<ReadingCatalogBookDto[]>([]);

  const [busy, setBusy] = useState(false);

  // Дейлик: режим редактирования и подтверждение сохранения
  const [dailyEditing, setDailyEditing] = useState(false);
  const [dailySaved, setDailySaved] = useState(false);

  // Ребёнок берётся из выбора в шапке дашборда — отдельный селектор внутри вкладки не нужен
  const childId = selectedChildId != null ? String(selectedChildId) : '';

  // Магазин навыка
  const [view, setView] = useState<'main' | 'shop'>('main');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [storeModal, setStoreModal] = useState(false);
  const [storeForm, setStoreForm] = useState<StoreForm>({ name: '', description: '', currencyName: '', currencyIcon: '', active: true });
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT);

  // Книги: модалка добавления/редактирования
  const [bookModal, setBookModal] = useState(false);
  const [bookMode, setBookMode] = useState<BookMode>('choose');
  const [editing, setEditing] = useState<ReadingBookDto | null>(null);
  const [bookForm, setBookForm] = useState<BookForm>(EMPTY_BOOK);

  // Модалка принятия заявки ребёнка
  const [approveRequest, setApproveRequest] = useState<ReadingRequestDto | null>(null);
  const [requestMode, setRequestMode] = useState<BookMode>('choose');
  const [requestForm, setRequestForm] = useState<BookForm>(EMPTY_BOOK);

  // Фильтры архива
  const [archiveQuery, setArchiveQuery] = useState('');
  const [archiveStatus, setArchiveStatus] = useState<'ALL' | 'read' | 'reading' | 'pending' | 'library'>('ALL');
  const [archiveGenre, setArchiveGenre] = useState('ALL');
  const [archiveSort, setArchiveSort] = useState<'added' | 'read' | 'pages' | 'name'>('added');

  // ---------- Загрузка ----------

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const storeList = await api.get<StoreDto[]>('/parent/stores');
        setStore(storeList.find((s) => s.templateType === 'READING') ?? null);
      } catch (e) {
        alert(errMsg(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadBooks = useCallback(async (id: string) => {
    try {
      setBooks(await api.get<ReadingBookDto[]>(`/parent/children/${id}/books`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  const loadStats = useCallback(async (id: string) => {
    try {
      setStats(await api.get<ReadingStatsDto>(`/parent/children/${id}/reading`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  const loadRequests = useCallback(async (id: string) => {
    try {
      setRequests(await api.get<ReadingRequestDto[]>(`/parent/children/${id}/reading-requests`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  const loadSettings = useCallback(async (id: string) => {
    try {
      setReadingSettings(await api.get<ReadingSettingsDto>(`/parent/children/${id}/reading-settings`));
    } catch {
      setReadingSettings(null);
    }
  }, []);

  const loadCatalog = useCallback(async (id: string) => {
    try {
      setCatalog(await api.get<ReadingCatalogBookDto[]>(`/parent/children/${id}/reading-book-catalog`));
    } catch {
      setCatalog([]);
    }
  }, []);

  const loadProducts = useCallback(async (storeId: number) => {
    try {
      setProducts(await api.get<ProductDto[]>(`/parent/stores/${storeId}/products`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    if (!childId) return;
    setDailyEditing(false);
    setDailySaved(false);
    setArchiveQuery('');
    setArchiveStatus('ALL');
    setArchiveGenre('ALL');
    setArchiveSort('added');
    void loadBooks(childId);
    void loadStats(childId);
    void loadRequests(childId);
    void loadSettings(childId);
    void loadCatalog(childId);
  }, [childId, loadBooks, loadStats, loadRequests, loadSettings, loadCatalog]);

  // Обновление данных после действий
  const refreshAll = useCallback(async () => {
    if (!childId) return;
    await Promise.all([loadBooks(childId), loadStats(childId), loadRequests(childId), loadCatalog(childId)]);
  }, [childId, loadBooks, loadStats, loadRequests, loadCatalog]);

  // ---------- Дейлик чтения ----------

  const saveDaily = async () => {
    if (!childId || !readingSettings) return;
    setBusy(true);
    try {
      const saved = await api.put<ReadingSettingsDto>(`/parent/children/${childId}/reading-settings`, {
        pagesTarget: readingSettings.pagesTarget,
        rewardAmount: readingSettings.rewardAmount,
        xpReward: readingSettings.xpReward,
      });
      setReadingSettings(saved);
      setDailyEditing(false);
      setDailySaved(true);
      setTimeout(() => setDailySaved(false), 2500);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Книги ----------

  const openCreate = () => {
    setEditing(null);
    setBookForm(EMPTY_BOOK);
    setBookMode('choose');
    setBookModal(true);
  };

  const openEdit = (book: ReadingBookDto) => {
    setEditing(book);
    setBookForm({
      name: book.name,
      author: book.author ?? '',
      series: book.series ?? '',
      genre: book.genre ?? '',
      pages: String(book.pages),
      multiplier: String(book.multiplier),
      active: book.active,
    });
    setBookMode('custom');
    setBookModal(true);
  };

  /** Создать книгу из каталога достижений (параметры готовые, множитель 1). */
  const createFromCatalog = async (item: ReadingCatalogBookDto) => {
    if (!store || !childId) return;
    setBusy(true);
    try {
      await api.post(`/parent/stores/${store.id}/children/${childId}/books`, {
        name: item.name,
        author: item.author,
        series: item.series,
        genre: item.genre,
        pages: item.pages,
        multiplier: 1,
        active: true,
      });
      setBookModal(false);
      await loadBooks(childId);
      await loadCatalog(childId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const saveBook = async () => {
    if (!bookForm.name.trim()) {
      alert('Укажите название книги');
      return;
    }
    const pages = Number(bookForm.pages);
    if (!Number.isFinite(pages) || pages < 0) {
      alert('Страниц должно быть неотрицательным числом');
      return;
    }
    const multiplier = Number(bookForm.multiplier);
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      alert('Множитель должен быть неотрицательным числом');
      return;
    }
    setBusy(true);
    try {
      const body = {
        name: bookForm.name.trim(),
        author: bookForm.author.trim() || null,
        series: bookForm.series.trim() || null,
        genre: bookForm.genre.trim() || null,
        pages,
        multiplier,
        active: bookForm.active,
      };
      if (editing) {
        await api.put(`/parent/books/${editing.id}`, body);
      } else {
        if (!store || !childId) return;
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
      await refreshAll();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const markRead = async (book: ReadingBookDto) => {
    if (!childId) return;
    setBusy(true);
    try {
      await api.post('/parent/reading-logs', { childId: Number(childId), bookId: book.id });
      await refreshAll();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Подтверждение отметок и заявок ----------

  const approveLog = async (log: ReadingLogDto) => {
    setBusy(true);
    try {
      await api.post(`/parent/reading-logs/${log.id}/approve`);
      await refreshAll();
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
      await refreshAll();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const openApproveRequest = (request: ReadingRequestDto) => {
    setApproveRequest(request);
    setRequestMode('choose');
    setRequestForm({ ...EMPTY_BOOK, name: request.title });
  };

  /** Принять заявку ребёнка книгой из каталога достижений. */
  const approveFromCatalog = async (item: ReadingCatalogBookDto) => {
    if (!approveRequest) return;
    setBusy(true);
    try {
      await api.post(`/parent/reading-requests/${approveRequest.id}/approve`, {
        name: item.name,
        author: item.author,
        series: item.series,
        genre: item.genre,
        pages: item.pages,
        multiplier: 1,
      });
      setApproveRequest(null);
      await refreshAll();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
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
      await refreshAll();
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

  // ---------- Магазин навыка ----------

  const openShop = () => {
    if (store) void loadProducts(store.id);
    setView('shop');
  };

  const openStoreEdit = () => {
    if (!store) return;
    setStoreForm({
      name: store.name,
      description: store.description ?? '',
      currencyName: store.currencyName,
      currencyIcon: store.currencyIcon,
      active: store.active,
    });
    setStoreModal(true);
  };

  const saveStore = async () => {
    if (!store || !storeForm.name.trim()) {
      alert('Укажите название магазина');
      return;
    }
    setBusy(true);
    try {
      const updated = await api.put<StoreDto>(`/parent/stores/${store.id}`, {
        name: storeForm.name.trim(),
        description: storeForm.description.trim() || null,
        currencyName: storeForm.currencyName.trim() || 'монета',
        currencyIcon: storeForm.currencyIcon.trim() || '🪙',
        active: storeForm.active,
      });
      setStore(updated);
      setStoreModal(false);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const openProductCreate = () => {
    if (!store) return;
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setProductModal(true);
  };

  const openProductEdit = (product: ProductDto) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      limitPerChild: product.limitPerChild != null ? String(product.limitPerChild) : '',
      active: product.active,
      effectType: product.effectType || 'NONE',
      effectLimit: product.effectLimit ?? '',
      effectValue: product.effectValue ? String(product.effectValue) : '',
    });
    setProductModal(true);
  };

  const saveProduct = async () => {
    if (!store) return;
    if (!productForm.name.trim()) {
      alert('Укажите название товара');
      return;
    }
    const price = Number(productForm.price);
    if (!price || price <= 0) {
      alert('Укажите цену больше нуля');
      return;
    }
    setBusy(true);
    try {
      const limit = productForm.limitPerChild.trim() ? Number(productForm.limitPerChild) : null;
      if (limit != null && (!Number.isFinite(limit) || limit < 1)) {
        throw new Error('Лимит должен быть положительным числом');
      }
      const effectValue = productForm.effectValue.trim() ? Number(productForm.effectValue) : 0;
      if (productForm.effectType !== 'NONE' && (!Number.isFinite(effectValue) || effectValue <= 0)) {
        throw new Error('Укажите величину эффекта больше нуля');
      }
      const body = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price,
        limitPerChild: limit,
        active: productForm.active,
        effectType: productForm.effectType || 'NONE',
        effectLimit: productForm.effectType !== 'NONE' ? productForm.effectLimit : null,
        effectValue: productForm.effectType !== 'NONE' ? effectValue : 0,
      };
      if (editingProduct) {
        await api.put(`/parent/products/${editingProduct.id}`, body);
      } else {
        await api.post(`/parent/stores/${store.id}/products`, body);
      }
      setProductModal(false);
      await loadProducts(store.id);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async (product: ProductDto) => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return;
    if (!store) return;
    try {
      await api.del(`/parent/products/${product.id}`);
      await loadProducts(store.id);
    } catch (e) {
      alert(errMsg(e));
    }
  };

  // ---------- Производные данные ----------

  const pendingLogs = stats?.logs.filter((l) => l.status === 'PENDING') ?? [];
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  const archiveGenres = Array.from(new Set(books.map((b) => b.genre).filter((g): g is string => !!g)));
  const archiveRows = books
    .map((book) => {
      const approved = (stats?.logs ?? []).find((l) => l.bookId === book.id && l.status === 'APPROVED');
      const pending = (stats?.logs ?? []).find((l) => l.bookId === book.id && l.status === 'PENDING');
      const page = book.currentPage ?? 0;
      const status: 'read' | 'reading' | 'pending' | 'library' = approved
        ? 'read'
        : pending
          ? 'pending'
          : page > 0 && page < book.pages
            ? 'reading'
            : 'library';
      return {
        book,
        status,
        points: approved ? approved.points : 0,
        readAt: approved ? approved.readAt : null,
      };
    })
    .filter((r) => {
      const q = archiveQuery.trim().toLowerCase();
      if (q && !`${r.book.name} ${r.book.author ?? ''} ${r.book.series ?? ''}`.toLowerCase().includes(q)) return false;
      if (archiveStatus !== 'ALL' && r.status !== archiveStatus) return false;
      if (archiveGenre !== 'ALL' && (r.book.genre ?? '') !== archiveGenre) return false;
      return true;
    })
    .sort((a, b) => {
      switch (archiveSort) {
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

  // ---------- Рендер ----------

  if (loading) return <Spinner label="Загружаем навык чтения…" />;

  if (!childId) {
    return <EmptyState title="Ребёнок не выбран" hint="Выберите ребёнка в шапке, чтобы увидеть его навык чтения" />;
  }

  if (!store) {
    return (
      <div className="space-y-4">
        <ReadingHeader />
        <EmptyState
          title="Магазин чтения не найден"
          hint="Включите шаблон «Чтение» в профиле ребёнка, чтобы добавить книги и товары"
        />
      </div>
    );
  }

  // ===== Вид магазина навыка =====
  if (view === 'shop') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setView('main')}>
            <ArrowLeft size={15} /> К чтению
          </button>
          <h1 className="text-xl font-extrabold">🛍️ {store.name}</h1>
        </div>

        <div className="card space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-2xl">
              {store.currencyIcon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">{store.name}</span>
                {!store.active && <span className="badge bg-slate-200 text-slate-600">неактивен</span>}
              </div>
              {store.description && <div className="text-sm text-slate-500">{store.description}</div>}
              <div className="text-xs font-medium text-indigo-600">
                Валюта: {store.currencyIcon} {store.currencyName}
              </div>
            </div>
            <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={openStoreEdit}>
              <Pencil size={14} /> Настройки магазина
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Товары ({products.length})</span>
              <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={openProductCreate}>
                <Plus size={14} /> Добавить товар
              </button>
            </div>
            {products.length === 0 ? (
              <EmptyState title="Товаров пока нет" hint="Добавьте первый товар — ребёнок сможет купить его за баллы" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Package size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold">{product.name}</span>
                        {!product.active && <span className="badge bg-slate-200 text-slate-600">скрыт</span>}
                      </div>
                      {product.description && <div className="truncate text-xs text-slate-500">{product.description}</div>}
                      <div className="mt-0.5 text-sm font-bold text-indigo-700">
                        {fmtAmount(product.price, store.currencyName)}
                      </div>
                      {product.limitPerChild != null && (
                        <div className="text-xs text-slate-500">лимит: {product.limitPerChild} шт./ребенок</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openProductEdit(product)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        title="Редактировать"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => void removeProduct(product)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        title="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Модалка настроек магазина */}
        {storeModal && (
          <Modal title="Настройки магазина" onClose={() => setStoreModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="label">Название</label>
                <input
                  className="input"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Описание</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Название валюты</label>
                  <input
                    className="input"
                    value={storeForm.currencyName}
                    onChange={(e) => setStoreForm({ ...storeForm, currencyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Иконка валюты</label>
                  <input
                    className="input"
                    value={storeForm.currencyIcon}
                    onChange={(e) => setStoreForm({ ...storeForm, currencyIcon: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={storeForm.active}
                  onChange={(e) => setStoreForm({ ...storeForm, active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Активен (виден детям)
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={() => setStoreModal(false)}>
                  Отмена
                </button>
                <button className="btn-primary" disabled={busy} onClick={() => void saveStore()}>
                  Сохранить
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Модалка товара */}
        {productModal && (
          <Modal title={editingProduct ? 'Редактировать товар' : 'Новый товар'} onClose={() => setProductModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="label">Название</label>
                <input
                  className="input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Например, закладка-герой"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Описание</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Цена</label>
                  <input
                    className="input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Лимит на ребенка</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={productForm.limitPerChild}
                    onChange={(e) => setProductForm({ ...productForm, limitPerChild: e.target.value })}
                    placeholder="без лимита"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={productForm.active}
                  onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Активен (виден детям)
              </label>

              {/* Эффект товара: увеличение лимита */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-sm font-bold text-slate-600">Эффект товара (увеличение лимита)</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label">Тип</label>
                    <select
                      className="input"
                      value={productForm.effectType}
                      onChange={(e) => setProductForm({ ...productForm, effectType: e.target.value })}
                    >
                      <option value="NONE">Нет эффекта</option>
                      <option value="LIMIT_ONCE">Одноразовое (на сегодня)</option>
                      <option value="LIMIT_PERMANENT">Постоянное (навсегда)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Лимит</label>
                    <select
                      className="input"
                      value={productForm.effectLimit}
                      disabled={productForm.effectType === 'NONE'}
                      onChange={(e) => setProductForm({ ...productForm, effectLimit: e.target.value })}
                    >
                      <option value="">— выберите —</option>
                      <option value="TV">Телевизор</option>
                      <option value="PC">Компьютер</option>
                      <option value="CONSOLE">Игровая приставка</option>
                      <option value="PHONE">Телефон</option>
                      <option value="TABLET">Планшет</option>
                      <option value="POCKET">Карманные деньги</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Величина (мин или ₽)</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={productForm.effectValue}
                      disabled={productForm.effectType === 'NONE'}
                      onChange={(e) => setProductForm({ ...productForm, effectValue: e.target.value })}
                      placeholder="например, 30"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Одноразовое — пополняет остаток на сегодня (можно больше лимита), постоянное — увеличивает базовый
                  лимит на будущие дни/недели.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={() => setProductModal(false)}>
                  Отмена
                </button>
                <button className="btn-primary" disabled={busy} onClick={() => void saveProduct()}>
                  Сохранить
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ===== Основной вид вкладки =====
  return (
    <div className="space-y-4 pb-16">
      <ReadingHeader store={store} onOpenShop={openShop} />

      {/* Статистика навыка */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Прочитано книг" value={String(stats.booksRead)} cls="from-indigo-50 to-indigo-100 text-indigo-700" />
          <StatCard label="Прочитано страниц" value={String(stats.pagesRead)} cls="from-sky-50 to-sky-100 text-sky-700" />
          <StatCard
            label="Баллов заработано"
            value={fmtAmount(stats.pointsEarned, store.currencyName)}
            cls="from-emerald-50 to-emerald-100 text-emerald-700"
          />
          <StatCard
            label="Ждут подтверждения"
            value={
              stats.pendingCount > 0 ? `${stats.pendingCount} · ${fmtAmount(stats.pendingPoints)}` : '0'
            }
            cls="from-amber-50 to-amber-100 text-amber-700"
          />
        </div>
      )}

      {/* Дейлик чтения: страницы в день, редактируется по кнопке */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            🎯 Дейлик чтения
            {dailySaved && <span className="badge bg-emerald-100 text-emerald-700">Сохранено ✓</span>}
          </div>
          {!dailyEditing && (
            <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setDailyEditing(true)}>
              <Pencil size={14} /> Изменить
            </button>
          )}
        </div>
        {!readingSettings ? (
          <p className="mt-2 text-sm text-slate-400">Настройки дейлика недоступны — включите навык чтения ребёнку</p>
        ) : dailyEditing ? (
          <div className="mt-3 space-y-3">
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
            <div className="flex justify-end gap-2">
              <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setDailyEditing(false)}>
                Отмена
              </button>
              <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void saveDaily()}>
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="badge bg-slate-100 text-slate-700">{readingSettings.pagesTarget} стр./день</span>
            <span className="badge bg-emerald-50 text-emerald-700">
              +{fmtAmount(readingSettings.rewardAmount)} {store.currencyName}
            </span>
            <span className="badge bg-indigo-50 text-indigo-700">+{readingSettings.xpReward} XP</span>
          </div>
        )}
      </div>

      {/* Требуют внимания: заявки и отметки ребёнка */}
      {(pendingRequests.length > 0 || pendingLogs.length > 0) && (
        <div className="space-y-2">
          {pendingRequests.map((request) => (
            <div key={`req-${request.id}`} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">📨 Заявка на книгу: {request.title}</div>
                <div className="text-xs text-slate-500">
                  {request.childName} · {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => openApproveRequest(request)}>
                <Check size={14} /> Принять
              </button>
              <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => void rejectRequest(request)}>
                <X size={14} /> Отклонить
              </button>
            </div>
          ))}
          {pendingLogs.map((log) => (
            <div key={`log-${log.id}`} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">📖 Ребёнок прочитал: {log.bookName}</div>
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
      )}

      {/* Архив чтения: единый список книг со статусами и действиями */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-600">Архив чтения ({archiveRows.length})</h3>
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={openCreate}>
            <Plus size={14} /> Добавить книгу
          </button>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            className="input !w-60"
            placeholder="Поиск по названию/автору…"
            value={archiveQuery}
            onChange={(e) => setArchiveQuery(e.target.value)}
          />
          <select
            className="input !w-auto"
            value={archiveStatus}
            onChange={(e) => setArchiveStatus(e.target.value as typeof archiveStatus)}
          >
            <option value="ALL">Все статусы</option>
            <option value="read">✅ Прочитана</option>
            <option value="reading">📖 Читает</option>
            <option value="pending">⏳ На проверке</option>
            <option value="library">📚 В библиотеке</option>
          </select>
          <select className="input !w-auto" value={archiveGenre} onChange={(e) => setArchiveGenre(e.target.value)}>
            <option value="ALL">Все жанры</option>
            {archiveGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            className="input !w-auto"
            value={archiveSort}
            onChange={(e) => setArchiveSort(e.target.value as typeof archiveSort)}
          >
            <option value="added">По добавлению</option>
            <option value="read">По дате прочтения</option>
            <option value="pages">По страницам</option>
            <option value="name">По названию</option>
          </select>
        </div>
        {archiveRows.length === 0 ? (
          <EmptyState
            title={books.length === 0 ? 'Книг пока нет' : 'Книг не найдено'}
            hint={books.length === 0 ? 'Нажмите «+» справа внизу, чтобы добавить первую книгу' : 'Измените фильтры'}
          />
        ) : (
          <div className="max-h-[480px] overflow-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Книга</th>
                  <th className="px-3 py-2">Жанр</th>
                  <th className="px-3 py-2">Страниц</th>
                  <th className="px-3 py-2">Статус</th>
                  <th className="px-3 py-2">Баллы</th>
                  <th className="px-3 py-2">Прочитана</th>
                  <th className="px-3 py-2 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {archiveRows.map((r) => {
                  const meta = ARCHIVE_STATUS[r.status];
                  return (
                    <tr key={r.book.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-800">
                          {r.book.name}
                          {!r.book.active && <span className="ml-2 text-xs font-normal text-slate-400">(скрыта)</span>}
                        </div>
                        <div className="text-xs text-slate-500">
                          {[r.book.author, r.book.series].filter(Boolean).join(' · ') || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{r.book.genre ?? '—'}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {r.book.pages}
                        {r.status === 'reading' && (
                          <span className="ml-1 text-xs text-sky-600">(стр. {r.book.currentPage ?? 0})</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`badge ${meta.cls}`}>{meta.label}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{r.points ? fmtAmount(r.points) : '—'}</td>
                      <td className="px-3 py-2 text-slate-500">
                        {r.readAt ? new Date(r.readAt).toLocaleDateString('ru-RU') : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          {r.status !== 'read' && r.status !== 'pending' && (
                            <button
                              className="btn-primary !px-2.5 !py-1.5 text-xs"
                              disabled={busy}
                              onClick={() => void markRead(r.book)}
                              title="Засчитать как прочитанную"
                            >
                              Засчитать
                            </button>
                          )}
                          <button
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                            onClick={() => openEdit(r.book)}
                            title="Редактировать"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => void removeBook(r.book)}
                            title="Удалить"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FAB: добавить книгу */}
      <button
        className="fixed bottom-20 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 transition hover:scale-105 hover:bg-indigo-700 active:scale-95 sm:bottom-8 sm:right-8"
        onClick={openCreate}
        title="Добавить книгу"
      >
        <Plus size={26} />
      </button>

      {/* Модалка книги: выбор источника / каталог достижений / форма */}
      {bookModal && (
        <Modal
          title={editing ? 'Редактировать книгу' : 'Новая книга'}
          onClose={() => setBookModal(false)}
          wide={!editing && bookMode !== 'custom'}
        >
          <div className="space-y-3">
            {!editing && bookMode === 'choose' && (
              <>
                <p className="text-sm text-slate-500">Откуда добавить книгу?</p>
                <ChooseSource
                  onCatalog={() => setBookMode('catalog')}
                  onCustom={() => {
                    setBookForm(EMPTY_BOOK);
                    setBookMode('custom');
                  }}
                />
              </>
            )}

            {!editing && bookMode === 'catalog' && (
              <>
                <BackButton onClick={() => setBookMode('choose')} />
                <CatalogPicker catalog={catalog} busy={busy} onPick={(item) => void createFromCatalog(item)} />
              </>
            )}

            {(editing || bookMode === 'custom') && <BookFormFields form={bookForm} setForm={setBookForm} />}

            {(editing || bookMode === 'custom') && (
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
                {!editing && <button className="btn-secondary" onClick={() => setBookMode('choose')}>Назад</button>}
                <button className="btn-secondary" onClick={() => setBookModal(false)}>Отмена</button>
                <button className="btn-primary" disabled={busy} onClick={() => void saveBook()}>Сохранить</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Модалка принятия заявки: выбор источника / каталог / форма */}
      {approveRequest && (
        <Modal title={`Принять заявку: ${approveRequest.title}`} onClose={() => setApproveRequest(null)} wide={requestMode !== 'custom'}>
          <div className="space-y-3">
            {requestMode === 'choose' && (
              <>
                <p className="text-sm text-slate-500">Чем станет книга из заявки?</p>
                <ChooseSource
                  onCatalog={() => setRequestMode('catalog')}
                  onCustom={() => setRequestMode('custom')}
                />
              </>
            )}

            {requestMode === 'catalog' && (
              <>
                <BackButton onClick={() => setRequestMode('choose')} />
                <CatalogPicker catalog={catalog} busy={busy} onPick={(item) => void approveFromCatalog(item)} />
              </>
            )}

            {requestMode === 'custom' && (
              <>
                <BackButton onClick={() => setRequestMode('choose')} />
                <BookFormFields form={requestForm} setForm={setRequestForm} />
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
                  <button className="btn-secondary" onClick={() => setApproveRequest(null)}>Отмена</button>
                  <button className="btn-primary" disabled={busy} onClick={() => void saveApproveRequest()}>Принять</button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- Вспомогательные элементы ----------

/** Шапка вкладки: заголовок и кнопка магазина навыка. Ребёнок выбирается в шапке дашборда. */
function ReadingHeader({ store, onOpenShop }: { store?: StoreDto; onOpenShop?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-extrabold">📚 Чтение</h1>
      {store && onOpenShop && (
        <button className="btn-secondary" onClick={onOpenShop}>
          <ShoppingBag size={17} /> Магазин навыка
        </button>
      )}
    </div>
  );
}

/** Карточка статистики. */
function StatCard({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br p-4 ${cls}`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="mt-0.5 text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="text-sm font-medium text-indigo-600 hover:underline" onClick={onClick}>
      <ArrowLeft size={16} className="mr-1 inline" /> Назад
    </button>
  );
}

/** Выбор источника: книга из достижений или кастомная. */
function ChooseSource({ onCatalog, onCustom }: { onCatalog: () => void; onCustom: () => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        onClick={onCatalog}
        className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Library size={20} />
        </span>
        <span className="font-bold text-slate-700">Книга из достижений</span>
        <span className="text-xs text-slate-500">
          Готовые книги серий: Гарри Поттер, Властелин колец, Нарния, Волков, Перси Джексон
        </span>
      </button>
      <button
        onClick={onCustom}
        className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <BookOpen size={20} />
        </span>
        <span className="font-bold text-slate-700">Кастомная</span>
        <span className="text-xs text-slate-500">
          Заполните параметры сами: название, автор, жанр, страницы, множитель
        </span>
      </button>
    </div>
  );
}

/** Список заготовок каталога достижений: серые — не прочитаны, зелёные — прочитаны. */
function CatalogPicker({
  catalog,
  busy,
  onPick,
}: {
  catalog: ReadingCatalogBookDto[];
  busy: boolean;
  onPick: (item: ReadingCatalogBookDto) => void;
}) {
  if (catalog.length === 0) {
    return <EmptyState title="Каталог пуст" hint="Книги из достижений скоро появятся" />;
  }
  return (
    <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
      {catalog.map((item) => (
        <button
          key={item.id}
          disabled={busy}
          onClick={() => onPick(item)}
          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
            item.read
              ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
              : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-white'
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
              item.read ? 'bg-emerald-100' : 'bg-slate-200'
            }`}
          >
            {item.read ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <BookOpen size={16} className="text-slate-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`truncate text-sm font-semibold ${item.read ? 'text-emerald-800' : 'text-slate-600'}`}>
              {item.name}
            </div>
            <div className="truncate text-xs text-slate-400">
              {[item.author, item.series, item.genre].filter(Boolean).join(' · ')} · {item.pages} стр.
            </div>
          </div>
          {item.read && <span className="badge bg-emerald-100 text-emerald-700">прочитана</span>}
        </button>
      ))}
    </div>
  );
}

/** Поля формы книги (кастомная): жанр из списка достижений, множитель по умолчанию 1. */
function BookFormFields({ form, setForm }: { form: BookForm; setForm: (next: BookForm) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Название</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          autoFocus
        />
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
          <select className="input" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
            <option value="">— не выбран —</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Страниц</label>
          <input
            className="input"
            type="number"
            min="0"
            value={form.pages}
            onChange={(e) => setForm({ ...form, pages: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Множитель</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.1"
            value={form.multiplier}
            onChange={(e) => setForm({ ...form, multiplier: e.target.value })}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Книга активна (видна ребёнку)
      </label>
    </div>
  );
}
