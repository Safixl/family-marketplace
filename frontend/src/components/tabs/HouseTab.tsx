import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Pencil, Plus, ShoppingBag, Trash2, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import {
  HouseCheckRequestDto,
  HouseDayDto,
  HouseMonthResponse,
  ProductDto,
  StoreDto,
  TaskCardDto,
  TaskItem,
} from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { DEFAULT_ROOM_COMMENTS, ROOM_RATINGS } from '../../lib/houseScale';
import Modal from '../Modal';
import { EmptyState, Spinner } from '../ui';

// ---------- Формы ----------

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

interface CardForm {
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  durationMinutes: string;
  rewardAmount: string;
  rewardStoreId: string;
  xpReward: string;
  houseBonus: string;
  active: boolean;
  childId: string;
  tasks: TaskItem[];
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

const EMPTY_CARD: CardForm = {
  title: '',
  description: '',
  icon: '🧹',
  difficulty: 'EASY',
  durationMinutes: '',
  rewardAmount: '',
  rewardStoreId: '',
  xpReward: '',
  houseBonus: '',
  active: true,
  childId: '',
  tasks: [{ q: '', a: '' }],
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const LIVING_OPTIONS = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface Props {
  /** Ребёнок, выбранный в шапке дашборда — чей календарь показываем. */
  selectedChildId?: number | null;
}

/**
 * Вкладка «Хозяйственность»: календарь домашних дел (оценки комнаты и помощи),
 * серия дней порядка и планируемые баллы, запросы ребёнка (проверка комнаты
 * и выполненная помощь), карточки «Помощь по дому» с FAB добавления и магазин навыка.
 */
export default function HouseTab({ selectedChildId }: Props) {
  const childId = selectedChildId != null ? String(selectedChildId) : '';

  // Базовые данные
  const [store, setStore] = useState<StoreDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Календарь
  const [cursor, setCursor] = useState(() => new Date());
  const [data, setData] = useState<HouseMonthResponse | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);
  const [editDay, setEditDay] = useState<string | null>(null);
  const [roomScore, setRoomScore] = useState(0);
  const [livingScore, setLivingScore] = useState(0);
  const [comment, setComment] = useState('');
  const [commentDirty, setCommentDirty] = useState(false);

  // Запросы ребёнка
  const [checkRequests, setCheckRequests] = useState<HouseCheckRequestDto[]>([]);
  const [cardRequests, setCardRequests] = useState<TaskCardDto[]>([]);

  // Карточки «Помощь по дому»
  const [cards, setCards] = useState<TaskCardDto[]>([]);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [cardModal, setCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<TaskCardDto | null>(null);
  const [cardForm, setCardForm] = useState<CardForm>(EMPTY_CARD);

  // Магазин навыка
  const [view, setView] = useState<'main' | 'shop'>('main');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [storeModal, setStoreModal] = useState(false);
  const [storeForm, setStoreForm] = useState<StoreForm>({ name: '', description: '', currencyName: '', currencyIcon: '', active: true });
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT);

  // ---------- Загрузка ----------

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [storeList, storeNames] = await Promise.all([
          api.get<StoreDto[]>('/parent/stores'),
          api.get<{ id: number; name: string }[]>('/parent/stores'),
        ]);
        setStore(storeList.find((s) => s.templateType === 'HOME') ?? null);
        setStores(storeNames);
      } catch (e) {
        alert(errMsg(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadMonth = useCallback(async () => {
    if (!childId || !store) return;
    setMonthLoading(true);
    try {
      const month = monthKey(cursor);
      setData(await api.get<HouseMonthResponse>(`/parent/stores/${store.id}/house?childId=${childId}&month=${month}`));
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setMonthLoading(false);
    }
  }, [childId, cursor, store]);

  const loadRequests = useCallback(async () => {
    try {
      const [checks, cardReqs] = await Promise.all([
        api.get<HouseCheckRequestDto[]>('/parent/house-check-requests'),
        api.get<TaskCardDto[]>('/parent/task-card-requests?skill=HOUSE'),
      ]);
      setCheckRequests(checks);
      setCardRequests(cardReqs);
    } catch {
      setCheckRequests([]);
      setCardRequests([]);
    }
  }, []);

  const loadCards = useCallback(async () => {
    try {
      setCards(await api.get<TaskCardDto[]>('/parent/task-cards?skill=HOUSE'));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  useEffect(() => {
    if (!childId) {
      setData(null);
      return;
    }
    void loadMonth();
    void loadRequests();
    void loadCards();
    // Живое обновление запросов ребёнка
    const timer = setInterval(() => {
      void loadRequests();
    }, 15000);
    return () => clearInterval(timer);
  }, [childId, loadMonth, loadRequests, loadCards]);

  // ---------- Календарь ----------

  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const now = new Date();
  const todayKey = dayKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const dayMap = new Map<string, HouseDayDto>();
  data?.days.forEach((d) => dayMap.set(d.day, d));

  const openDay = (day: number) => {
    const key = dayKey(year, month, day);
    if (key > todayKey) {
      alert('Нельзя проставить баллы за ещё не наступившую дату');
      return;
    }
    const existing = dayMap.get(key);
    setRoomScore(existing?.roomScore ?? 0);
    setLivingScore(existing?.livingScore ?? 0);
    setComment(existing?.comment ?? DEFAULT_ROOM_COMMENTS[existing?.roomScore ?? 0] ?? '');
    setCommentDirty(false);
    setEditDay(key);
  };

  const saveDay = async () => {
    if (!editDay || !childId || !store) return;
    setBusy(true);
    try {
      await api.put(`/parent/stores/${store.id}/house-days`, {
        childId: Number(childId),
        day: editDay,
        roomScore,
        livingScore,
        comment: comment.trim() || null,
      });
      setEditDay(null);
      await loadMonth();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const shiftMonth = (delta: number) => {
    setCursor(new Date(year, month - 1 + delta, 1));
  };

  const cellClass = (d: HouseDayDto | undefined) => {
    if (!d || (d.roomScore === 0 && d.livingScore === 0)) {
      return 'bg-slate-700/40 text-slate-300 hover:bg-slate-700/70';
    }
    if (d.points < 0) return 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30';
    if (d.points > 0) return 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30';
    return 'bg-amber-500/15 text-amber-200 hover:bg-amber-500/25';
  };

  // ---------- Запросы ----------

  const approveCheck = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/house-check-requests/${id}/approve`);
      await Promise.all([loadRequests(), loadMonth()]);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const rejectCheck = async (id: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/house-check-requests/${id}/reject`);
      await loadRequests();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const approveCard = async (id: number | null) => {
    if (id == null) return;
    setBusy(true);
    try {
      await api.post(`/parent/task-card-requests/${id}/approve`);
      await loadRequests();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const rejectCard = async (id: number | null) => {
    if (id == null) return;
    setBusy(true);
    try {
      await api.post(`/parent/task-card-requests/${id}/reject`);
      await loadRequests();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Карточки «Помощь по дому» ----------

  const openCardCreate = () => {
    setEditingCard(null);
    setCardForm(EMPTY_CARD);
    setCardModal(true);
  };

  const openCardEdit = (card: TaskCardDto) => {
    setEditingCard(card);
    setCardForm({
      title: card.title,
      description: card.description ?? '',
      icon: card.icon,
      difficulty: card.difficulty,
      durationMinutes: String(card.durationMinutes),
      rewardAmount: card.rewardAmount > 0 ? String(card.rewardAmount) : '',
      rewardStoreId: card.rewardStoreId != null ? String(card.rewardStoreId) : '',
      xpReward: card.xpReward > 0 ? String(card.xpReward) : '',
      houseBonus: card.houseBonus > 0 ? String(card.houseBonus) : '',
      active: card.active,
      childId: '',
      tasks: card.tasks.length > 0 ? card.tasks : [{ q: '', a: '' }],
    });
    setCardModal(true);
  };

  const saveCard = async () => {
    if (!cardForm.title.trim()) {
      alert('Укажите название карточки');
      return;
    }
    const tasks = cardForm.tasks.filter((t) => t.q.trim() && t.a.trim());
    if (tasks.length === 0) {
      alert('Добавьте хотя бы одно задание с ответом');
      return;
    }
    const duration = Number(cardForm.durationMinutes);
    if (!duration || duration <= 0) {
      alert('Укажите время на выполнение');
      return;
    }
    setBusy(true);
    try {
      const body = {
        skill: 'HOUSE',
        title: cardForm.title.trim(),
        description: cardForm.description.trim() || null,
        icon: cardForm.icon.trim() || '🧹',
        difficulty: cardForm.difficulty,
        tasks,
        durationMinutes: duration,
        rewardAmount: cardForm.rewardAmount ? Number(cardForm.rewardAmount) : 0,
        rewardStoreId: cardForm.rewardStoreId ? Number(cardForm.rewardStoreId) : null,
        xpReward: cardForm.xpReward ? Number(cardForm.xpReward) : 0,
        houseBonus: cardForm.houseBonus ? Number(cardForm.houseBonus) : 0,
        rarity: 'COMMON',
        hiddenReward: false,
        successPercent: 80,
        active: cardForm.active,
        childId: cardForm.childId ? Number(cardForm.childId) : null,
      };
      if (editingCard) {
        await api.put(`/parent/task-cards/${editingCard.id}`, body);
      } else {
        await api.post('/parent/task-cards', body);
      }
      setCardModal(false);
      await loadCards();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const removeCard = async (card: TaskCardDto) => {
    if (!window.confirm(`Удалить карточку «${card.title}»?`)) return;
    try {
      await api.del(`/parent/task-cards/${card.id}`);
      await loadCards();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  // ---------- Магазин навыка ----------

  const openShop = useCallback(() => {
    if (store) {
      api
        .get<ProductDto[]>(`/parent/stores/${store.id}/products`)
        .then(setProducts)
        .catch((e) => alert(errMsg(e)));
    }
    setView('shop');
  }, [store]);

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
      await openShop();
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
      if (store) {
        setProducts(await api.get<ProductDto[]>(`/parent/stores/${store.id}/products`));
      }
    } catch (e) {
      alert(errMsg(e));
    }
  };

  // ---------- Рендер ----------

  if (loading) return <Spinner label="Загружаем навык хозяйственности…" />;

  if (!childId) {
    return <EmptyState title="Ребёнок не выбран" hint="Выберите ребёнка в шапке, чтобы видеть его календарь" />;
  }

  if (!store) {
    return (
      <div className="space-y-4">
        <HouseHeader />
        <EmptyState
          title="Магазин хозяйственности не найден"
          hint="Включите шаблон «Хозяйственность» в профиле ребёнка"
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
            К хозяйственности
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
  const pendingChecks = checkRequests.filter((r) => r.status === 'PENDING');
  const plannedPoints = data ? data.monthPoints + data.pendingPoints : 0;

  return (
    <div className="space-y-4 pb-16">
      <HouseHeader onOpenShop={openShop} />

      {/* Статистика: серия порядка и баллы */}
      {data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 p-4 text-orange-700">
            <div className="text-2xl font-extrabold">🔥 {data.currentStreak}</div>
            <div className="mt-0.5 text-xs font-medium opacity-80">
              серия порядка в комнате
              {data.nextStreakBonus > 0 && ` · +${data.nextStreakBonus} за следующий день`}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 text-emerald-700">
            <div className="text-2xl font-extrabold">{fmtAmount(plannedPoints)}</div>
            <div className="mt-0.5 text-xs font-medium opacity-80">планируется к начислению</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 p-4 text-sky-700">
            <div className="text-2xl font-extrabold">{data.positiveRoomDays}</div>
            <div className="mt-0.5 text-xs font-medium opacity-80">дней с комнатой «+»</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 text-indigo-700">
            <div className="text-2xl font-extrabold">{data.positiveLivingDays}</div>
            <div className="mt-0.5 text-xs font-medium opacity-80">дней с помощью «+»</div>
          </div>
        </div>
      )}

      {/* Запросы ребёнка: проверка комнаты */}
      {pendingChecks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-600">Запросы на проверку комнаты</h3>
          {pendingChecks.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <span className="text-xl">{r.childAvatar}</span>
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-semibold text-slate-800">{r.childName}</div>
                <div className="text-xs text-slate-500">просит проверить комнату · {new Date(r.day).toLocaleDateString('ru-RU')}</div>
              </div>
              <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void approveCheck(r.id)}>
                <CheckCircle2 size={14} /> Комната убрана
              </button>
              <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void rejectCheck(r.id)}>
                <XCircle size={14} /> Отклонить
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Запросы ребёнка: выполненная помощь */}
      {cardRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-600">Отчёты о выполненной помощи</h3>
          {cardRequests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <span className="text-xl">{r.icon}</span>
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-semibold text-slate-800">{r.title}</div>
                <div className="text-xs text-slate-500">отчёт о выполненной помощи</div>
              </div>
              <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void approveCard(r.childCardId)}>
                <CheckCircle2 size={14} /> Принять помощь
              </button>
              <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void rejectCard(r.childCardId)}>
                <XCircle size={14} /> Отклонить
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Календарь + карточки: календарь слева, карточки справа */}
      <div className="grid items-start gap-4 lg:grid-cols-5">
      <div className="card p-4 lg:col-span-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-600">Календарь домашних дел</h3>
          <div className="flex items-center gap-2">
            <button className="btn-secondary !px-2.5 !py-2" onClick={() => shiftMonth(-1)}>
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[140px] text-center text-sm font-bold">
              {cursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </span>
            <button className="btn-secondary !px-2.5 !py-2" onClick={() => shiftMonth(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {monthLoading ? (
          <Spinner label="Загружаем календарь…" />
        ) : (
          <>
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
                const isFuture = key > todayKey;
                return (
                  <button
                    key={key}
                    onClick={() => openDay(day)}
                    disabled={isFuture}
                    className={`flex h-12 flex-col items-center justify-center rounded-xl text-sm font-semibold transition ${
                      isFuture ? 'cursor-not-allowed bg-slate-800/40 text-slate-600' : cellClass(d)
                    }`}
                    title={isFuture ? 'Будущая дата' : 'Отметить день'}
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
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ROOM_RATINGS.map((r) => (
                <span key={r.value} className="badge bg-slate-100 text-slate-600" title={r.hint}>
                  {r.icon} {r.label} ({r.value > 0 ? `+${r.value}` : r.value} 🧹)
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Нажмите на день, чтобы проставить оценки. Помощь по дому: от −3 до +6.
              Баллы начисляются автоматически 1-го числа следующего месяца (звёздочка * — ожидает начисления).
            </p>
          </>
        )}
      </div>

      {/* Карточки «Помощь по дому» */}
      <div className="card p-4 lg:col-span-2">
        <h3 className="text-sm font-bold text-slate-600">Карточки «Помощь по дому» ({cards.length})</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Задания с бонусом к помощи в календаре. Ребёнок присылает отчёт о выполнении — он появится в блоке запросов.
        </p>
        {cards.length === 0 ? (
          <EmptyState
            title="Карточек пока нет"
            hint="Нажмите круглую кнопку «+» справа внизу, чтобы создать первую карточку помощи"
          />
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                <span className="text-2xl">{card.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {card.title}
                    {!card.active && <span className="ml-2 text-xs font-normal text-slate-400">(скрыта)</span>}
                  </div>
                  <div className="text-xs text-slate-500">
                    {card.difficulty} · {card.durationMinutes} мин · {card.tasks.length} заданий
                    {card.houseBonus > 0 && ` · +${card.houseBonus} 🧹 к помощи`}
                    {card.rewardAmount > 0 && ` · +${fmtAmount(card.rewardAmount, store.currencyName)}`}
                    {card.xpReward > 0 && ` · +${card.xpReward} XP`}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => openCardEdit(card)} title="Редактировать">
                    <Pencil size={15} />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => void removeCard(card)}
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

      {/* FAB: добавить карточку помощи */}
      <button
        className="fixed bottom-20 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/40 transition hover:scale-105 hover:bg-emerald-700 active:scale-95 sm:bottom-8 sm:right-8"
        onClick={openCardCreate}
        title="Добавить карточку помощи"
      >
        <Plus size={26} />
      </button>

      {/* Модалка оценки дня */}
      {editDay && (
        <Modal title={`Оценка за ${editDay}`} onClose={() => setEditDay(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">Хозяйственность</label>
              <div className="flex flex-wrap gap-1.5">
                {ROOM_RATINGS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => {
                      setRoomScore(r.value);
                      if (!commentDirty) {
                        setComment(DEFAULT_ROOM_COMMENTS[r.value] ?? '');
                      }
                    }}
                    title={r.hint}
                    className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-bold transition ${
                      roomScore === r.value
                        ? r.value < 0
                          ? 'bg-rose-500 text-white'
                          : r.value > 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span>
                      {r.label} · {r.value > 0 ? `+${r.value}` : r.value} 🧹
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">{ROOM_RATINGS.find((r) => r.value === roomScore)?.hint}</p>
            </div>
            <div>
              <label className="label">Помощь по дому (от −3 до +6)</label>
              <div className="flex flex-wrap gap-1.5">
                {LIVING_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setLivingScore(v)}
                    className={`h-10 flex-1 rounded-xl text-sm font-bold transition ${
                      livingScore === v
                        ? v < 0
                          ? 'bg-rose-500 text-white'
                          : v > 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {v > 0 ? `+${v}` : v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Комментарий для ребёнка</label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={comment}
                placeholder={
                  DEFAULT_ROOM_COMMENTS[roomScore] ??
                  'Напишите, что особенно понравилось (например, «Кровать заправлена, стол в порядке! 🎉»)'
                }
                onChange={(e) => {
                  setComment(e.target.value);
                  setCommentDirty(true);
                }}
              />
              <p className="mt-1 text-xs text-slate-400">
                Для −2, −1 и 0 подставляется дефолтный текст — можете скорректировать. Для +1 и +2 напишите свой
                личный комментарий ребёнку.
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              Итого за день: {roomScore + livingScore > 0 ? '+' : ''}
              {roomScore + livingScore} баллов (начислятся 1-го числа следующего месяца)
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setEditDay(null)}>Отмена</button>
              <button className="btn-primary" disabled={busy} onClick={() => void saveDay()}>Сохранить</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модалка карточки помощи */}
      {cardModal && (
        <Modal title={editingCard ? 'Редактировать карточку' : 'Новая карточка помощи'} onClose={() => setCardModal(false)} wide>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Название</label>
                <input className="input" value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="label">Иконка</label>
                <input className="input" value={cardForm.icon} onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Описание</label>
              <textarea
                className="input min-h-[60px] resize-y"
                value={cardForm.description}
                onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Сложность</label>
                <select className="input" value={cardForm.difficulty} onChange={(e) => setCardForm({ ...cardForm, difficulty: e.target.value })}>
                  <option value="EASY">Лёгкая</option>
                  <option value="MEDIUM">Средняя</option>
                  <option value="HARD">Сложная</option>
                </select>
              </div>
              <div>
                <label className="label">Время (мин)</label>
                <input type="number" min={1} className="input" value={cardForm.durationMinutes} onChange={(e) => setCardForm({ ...cardForm, durationMinutes: e.target.value })} />
              </div>
              <div>
                <label className="label">Бонус к помощи (+n, макс +6/день)</label>
                <input type="number" min={0} max={6} className="input" value={cardForm.houseBonus} onChange={(e) => setCardForm({ ...cardForm, houseBonus: e.target.value })} />
              </div>
            </div>

            {/* Задания */}
            <div>
              <label className="label">Задания (вопрос + ответ)</label>
              <div className="space-y-2">
                {cardForm.tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Вопрос"
                      value={task.q}
                      onChange={(e) => {
                        const next = [...cardForm.tasks];
                        next[i] = { ...next[i], q: e.target.value };
                        setCardForm({ ...cardForm, tasks: next });
                      }}
                    />
                    <input
                      className="input w-40"
                      placeholder="Ответ"
                      value={task.a}
                      onChange={(e) => {
                        const next = [...cardForm.tasks];
                        next[i] = { ...next[i], a: e.target.value };
                        setCardForm({ ...cardForm, tasks: next });
                      }}
                    />
                    <button
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => setCardForm({ ...cardForm, tasks: cardForm.tasks.filter((_, j) => j !== i) })}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn-secondary mt-2 !px-3 !py-1.5 text-xs"
                onClick={() => setCardForm({ ...cardForm, tasks: [...cardForm.tasks, { q: '', a: '' }] })}
              >
                <Plus size={14} /> Добавить задание
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Награда ({store.currencyIcon})</label>
                <input type="number" min={0} step="0.01" className="input" value={cardForm.rewardAmount} onChange={(e) => setCardForm({ ...cardForm, rewardAmount: e.target.value })} />
              </div>
              <div>
                <label className="label">Магазин награды</label>
                <select className="input" value={cardForm.rewardStoreId} onChange={(e) => setCardForm({ ...cardForm, rewardStoreId: e.target.value })}>
                  <option value="">— без валюты —</option>
                  {stores.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Опыт (XP)</label>
                <input type="number" min={0} className="input" value={cardForm.xpReward} onChange={(e) => setCardForm({ ...cardForm, xpReward: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Для ребёнка (пусто — всем)</label>
              <ChildSelect value={cardForm.childId} onChange={(v) => setCardForm({ ...cardForm, childId: v })} />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={cardForm.active}
                onChange={(e) => setCardForm({ ...cardForm, active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
              />
              Активна (видна ребёнку)
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setCardModal(false)}>
                Отмена
              </button>
              <button className="btn-primary" disabled={busy} onClick={() => void saveCard()}>
                {editingCard ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- Вспомогательные элементы ----------

/** Шапка вкладки: заголовок и кнопка магазина навыка. */
function HouseHeader({ onOpenShop }: { onOpenShop?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-extrabold">🏠 Хозяйственность</h1>
      {onOpenShop && (
        <button className="btn-secondary" onClick={onOpenShop}>
          <ShoppingBag size={17} /> Магазин навыка
        </button>
      )}
    </div>
  );
}

/** Селектор ребёнка для привязки карточки (загружает список детей). */
function ChildSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [children, setChildren] = useState<{ id: number; name: string; avatarEmoji: string }[]>([]);
  useEffect(() => {
    api
      .get<{ id: number; name: string; avatarEmoji: string; active: boolean }[]>('/parent/children')
      .then((list) => setChildren(list.filter((c) => c.active)))
      .catch(() => setChildren([]));
  }, []);
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— всем —</option>
      {children.map((c) => (
        <option key={c.id} value={String(c.id)}>
          {c.avatarEmoji} {c.name}
        </option>
      ))}
    </select>
  );
}
