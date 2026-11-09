import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShoppingBag,
  Trophy,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../../api/client';
import {
  MathBaseDifficulty,
  MathCardAdminDto,
  MathCardAdminDayDto,
  MathCardApprovalDto,
  MathTopicDto,
  ProductDto,
  StoreDto,
} from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import AchievementsTab from './AchievementsTab';
import PendingPurchasesCard from '../PendingPurchasesCard';
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

const CARD_STATUS: Record<string, { label: string; cls: string }> = {
  CREATED: { label: '🗓 Сгенерирована', cls: 'bg-slate-100 text-slate-600' },
  REQUESTED: { label: '⏳ Ждёт одобрения', cls: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '✅ Одобрена', cls: 'bg-sky-100 text-sky-700' },
  IN_PROGRESS: { label: '✍️ В работе', cls: 'bg-indigo-100 text-indigo-700' },
  SUCCESS: { label: '🏆 Решена', cls: 'bg-emerald-100 text-emerald-700' },
  FAILED: { label: '❌ Не решена', cls: 'bg-rose-100 text-rose-700' },
};

const TASK_TYPE_LABELS: Record<string, string> = {
  CALC: 'пример',
  TEXT: 'задача',
  EQUATION: 'уравнение',
  FRACTIONS: 'дроби',
  NEGATIVE: 'отрицательные',
};

const BASE_LABELS: Record<MathBaseDifficulty, string> = {
  EASY: 'Легкий 🟢',
  MEDIUM: 'Средний ⚪',
  HIGH: 'Высокий 🔵',
  HARD: 'Сложный 🟣',
};

interface Props {
  /** Ребёнок, выбранный в шапке дашборда — чьи карточки показываем. */
  selectedChildId?: number | null;
}

/**
 * Вкладка «Математика» навыка: сегодняшние сгенерированные карточки с перегенерацией
 * (карточки целиком и отдельных задач), запросы ребёнка на взятие карточки,
 * настройки тем генератора и магазин навыка.
 */
export default function MathTab({ selectedChildId }: Props) {
  // Ребёнок берётся из выбора в шапке дашборда — отдельный селектор внутри вкладки не нужен
  const childId = selectedChildId != null ? String(selectedChildId) : '';

  // Базовые данные
  const [store, setStore] = useState<StoreDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Карточки дня и запросы на одобрение
  const [day, setDay] = useState<MathCardAdminDayDto | null>(null);
  const [approvals, setApprovals] = useState<MathCardApprovalDto[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Дейлик-строка «Сохранено» для настроек
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Магазин навыка
  const [view, setView] = useState<'main' | 'shop' | 'settings' | 'achievements'>('main');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [storeModal, setStoreModal] = useState(false);
  const [storeForm, setStoreForm] = useState<StoreForm>({ name: '', description: '', currencyName: '', currencyIcon: '', active: true });
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT);

  // Настройки генератора (темы + базовая сложность)
  const [topics, setTopics] = useState<MathTopicDto[] | null>(null);

  // ---------- Загрузка ----------

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const storeList = await api.get<StoreDto[]>('/parent/stores');
        setStore(storeList.find((s) => s.templateType === 'MATH') ?? null);
      } catch (e) {
        alert(errMsg(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadDay = useCallback(async (id: string) => {
    try {
      setDay(await api.get<MathCardAdminDayDto>(`/parent/children/${id}/math-cards`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  const loadApprovals = useCallback(async () => {
    try {
      setApprovals(await api.get<MathCardApprovalDto[]>('/parent/math-card-approvals'));
    } catch {
      setApprovals([]);
    }
  }, []);

  useEffect(() => {
    if (!childId) {
      setDay(null);
      return;
    }
    setExpandedCards(new Set());
    void loadDay(childId);
    void loadApprovals();
    // Живое обновление: запросы ребёнка на взятие карточки появляются без перезагрузки
    const timer = setInterval(() => {
      void loadDay(childId);
      void loadApprovals();
    }, 15000);
    return () => clearInterval(timer);
  }, [childId, loadDay, loadApprovals]);

  const loadTopics = useCallback(async () => {
    try {
      setTopics(await api.get<MathTopicDto[]>('/parent/math-card-settings'));
    } catch (e) {
      alert(errMsg(e));
      setTopics([]);
    }
  }, []);

  const loadProducts = useCallback(async (storeId: number) => {
    try {
      setProducts(await api.get<ProductDto[]>(`/parent/stores/${storeId}/products`));
    } catch (e) {
      alert(errMsg(e));
    }
  }, []);

  // ---------- Запросы на одобрение ----------

  const decide = async (cardId: number, decision: 'approve' | 'reject') => {
    setBusy(true);
    try {
      await api.post(`/parent/math-card-approvals/${cardId}/${decision}`);
      await Promise.all([loadApprovals(), childId ? loadDay(childId) : Promise.resolve()]);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Перегенерация ----------

  const regenerateCard = async (card: MathCardAdminDto) => {
    setBusy(true);
    try {
      const updated = await api.post<MathCardAdminDto>(`/parent/math-cards/${card.id}/regenerate`, {});
      setDay((prev) =>
        prev ? { ...prev, cards: prev.cards.map((c) => (c.id === updated.id ? updated : c)) } : prev,
      );
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const regenerateTask = async (taskId: number) => {
    setBusy(true);
    try {
      const updated = await api.post<MathCardAdminDto>(`/parent/math-card-tasks/${taskId}/regenerate`, {});
      setDay((prev) =>
        prev ? { ...prev, cards: prev.cards.map((c) => (c.id === updated.id ? updated : c)) } : prev,
      );
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const toggleCard = (cardId: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // ---------- Настройки генератора ----------

  const patchTopic = (id: number, next: Partial<MathTopicDto>) => {
    setTopics((prev) => (prev ?? []).map((t) => (t.id === id ? { ...t, ...next } : t)));
  };

  const saveTopics = async () => {
    if (!topics) return;
    setBusy(true);
    try {
      const items = topics.map((t) => ({
        topicId: t.id,
        active: t.active,
        baseDifficulty: t.baseDifficulty,
      }));
      const saved = await api.put<MathTopicDto[]>('/parent/math-card-settings', { items });
      setTopics(saved);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
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

  // ---------- Рендер ----------

  if (loading) return <Spinner label="Загружаем навык математики…" />;

  if (!childId) {
    return <EmptyState title="Ребёнок не выбран" hint="Выберите ребёнка в шапке, чтобы увидеть его карточки" />;
  }

  if (!store) {
    return (
      <div className="space-y-4">
        <MathHeader />

        <EmptyState
          title="Магазин математики не найден"
          hint="Включите шаблон «Математика» в профиле ребёнка, чтобы генерировать карточки"
        />
      </div>
    );
  }

  // ===== Вид достижений навыка =====
  if (view === 'achievements') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setView('main')}>
            К математике
          </button>
          <h1 className="text-xl font-extrabold">🏆 Достижения</h1>
        </div>
        <AchievementsTab skill="MATH" selectedChildId={selectedChildId} />
      </div>
    );
  }

  // ===== Вид магазина навыка =====
  if (view === 'shop') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setView('main')}>
            <ArrowLeft size={15} /> К математике
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


          {/* Ожидают подтверждения: покупки и активации этого магазина */}
          <PendingPurchasesCard storeId={store.id} onChanged={() => void openShop()} />

          <div className="border-t border-slate-100 pt-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Товары ({products.length})</span>
              <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={openProductCreate}>
                <Plus size={14} /> Добавить товар
              </button>
            </div>
            {products.length === 0 ? (
              <EmptyState title="Товаров пока нет" hint="Добавьте первый товар — ребёнок сможет купить его за «Матриксы»" />
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

  // ===== Вид настроек генератора =====
  if (view === 'settings') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setView('main')}>
            <ArrowLeft size={15} /> К математике
          </button>
          <h1 className="text-xl font-extrabold">⚙️ Настройки карточек</h1>
        </div>

        <div className="card space-y-4 p-4">
          <p className="text-sm text-slate-500">
            Включённые темы попадают в пул генерации ежедневных карточек. Базовый уровень сложности скрыт от ребёнка
            и смещает реальную сложность задач (потолок — «Сложный»).
          </p>
          {topics === null ? (
            <Spinner label="Загружаем темы…" />
          ) : (
            <div className="space-y-2">
              {topics.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-3 transition ${t.active ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'}`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={t.active}
                      onClick={() => patchTopic(t.id, { active: !t.active })}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${t.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${t.active ? 'left-[22px]' : 'left-0.5'}`}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800">{t.name}</div>
                      <div className="text-xs text-slate-400">Рекомендовано: {t.gradeLabel}</div>
                    </div>
                    <select
                      className="input !w-auto text-sm"
                      value={t.baseDifficulty}
                      disabled={!t.active}
                      onChange={(e) => patchTopic(t.id, { baseDifficulty: e.target.value as MathBaseDifficulty })}
                    >
                      {(Object.keys(BASE_LABELS) as MathBaseDifficulty[]).map((d) => (
                        <option key={d} value={d}>
                          {BASE_LABELS[d]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            {settingsSaved && <span className="badge bg-emerald-100 text-emerald-700">Сохранено ✓</span>}
            <button className="btn-primary" onClick={() => void saveTopics()} disabled={busy || topics === null}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Основной вид вкладки =====
  const cards = day?.cards ?? [];
  const regenerateAllowed = (card: MathCardAdminDto) =>
    (card.status === 'CREATED' || card.status === 'REQUESTED') && card.level !== 'REVIEW';

  return (
    <div className="space-y-4 pb-16">
      <MathHeader
        onOpenSettings={() => {
          setView('settings');
          void loadTopics();
        }}
        onOpenShop={openShop}
        onOpenAchievements={() => setView('achievements')}
      />

      {/* Прогресс дня */}
      {day && (
        <div className="card flex flex-wrap items-center justify-between gap-2 p-4">
          <div className="text-sm font-bold text-slate-600">Сегодня решено карточек</div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: day.dailyLimit }).map((_, i) => (
              <span
                key={i}
                className={`h-3.5 w-3.5 rounded-full ${i < day.doneToday ? 'bg-emerald-500' : 'bg-slate-200'}`}
              />
            ))}
            <span className="ml-1 text-sm font-extrabold text-slate-700">
              {day.doneToday} / {day.dailyLimit}
            </span>
          </div>
        </div>
      )}

      {/* Запросы ребёнка на взятие карточки */}
      {approvals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-600">Запросы на взятие карточки</h3>
          {approvals.map((a) => (
            <div key={a.cardId} className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <span className="text-xl">{a.childAvatar}</span>
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-semibold text-slate-800">
                  {a.childName} · {a.levelEmoji} {a.levelLabel}
                </div>
                <div className="text-xs text-slate-500">
                  {a.taskCount} задач · {a.minutes} мин · ⚡ +{a.xpReward} XP
                </div>
              </div>
              <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void decide(a.cardId, 'approve')}>
                <Check size={14} /> Одобрить
              </button>
              <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void decide(a.cardId, 'reject')}>
                <X size={14} /> Отклонить
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Сегодняшние карточки: слоты дня, свободные слоты — заглушки */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-600">Карточки на сегодня ({cards.length})</h3>
        {cards.map((card) => {
            const meta = CARD_STATUS[card.status] ?? CARD_STATUS.CREATED;
            const expanded = expandedCards.has(card.id);
            return (
              <div key={card.id} className="card space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100 text-2xl">
                    {card.levelEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{card.levelLabel}</span>
                      {card.status !== 'CREATED' &&
                        (card.level === 'REVIEW' && card.status === 'APPROVED' ? (
                          <span className="badge bg-amber-50 text-amber-700">📝 без наград · без таймера</span>
                        ) : (
                          <span className={`badge ${meta.cls}`}>{meta.label}</span>
                        ))}
                      {card.status === 'SUCCESS' && card.resultPercent != null && (
                        <span className="badge bg-emerald-50 text-emerald-700">{card.resultPercent}% · ⚡ +{card.xpEarned} XP</span>
                      )}
                      {card.status === 'FAILED' && (
                        <span className="badge bg-rose-50 text-rose-700">
                          {card.resultPercent ?? 0}% · ⚡ +{card.xpEarned} XP
                        </span>
                      )}
                    </div>
                    <div className="truncate text-sm text-slate-500">{card.description}</div>
                    <div className="text-xs text-slate-400">
                      {card.taskCount} задач · {card.minutes} мин · до ⚡ +{card.maxMatrixReward} XP
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {regenerateAllowed(card) && card.level !== 'OLYMPIAD' && (
                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        disabled={busy}
                        onClick={() => void regenerateCard(card)}
                        title="Перегенерировать карточку"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                    <button
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      onClick={() => toggleCard(card.id)}
                      title={expanded ? 'Свернуть задачи' : 'Показать задачи'}
                    >
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    {card.tasks.length === 0 ? (
                      <p className="py-2 text-center text-sm text-slate-400">
                        Задачи появятся, когда ребёнок начнёт карточку
                      </p>
                    ) : (
                      card.tasks.map((task, idx) => (
                        <div key={task.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                          <span className="w-6 shrink-0 text-center text-sm font-bold text-slate-400">{idx + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-800">{task.text}</div>
                            {task.correct === true ? (
                              <div className="text-xs font-medium text-emerald-600">✅ {task.childAnswer}</div>
                            ) : task.correct === false ? (
                              <div className="text-xs font-medium text-rose-600">❌ {task.childAnswer} · ✅ {task.answer}</div>
                            ) : (
                              <div className="text-xs text-slate-400">
                                {TASK_TYPE_LABELS[task.taskType] ?? task.taskType}
                                {regenerateAllowed(card) ? ` · ответ: ${task.answer}` : ''}
                              </div>
                            )}
                          </div>
                          {regenerateAllowed(card) && card.level !== 'OLYMPIAD' && (
                            <button
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                              disabled={busy}
                              onClick={() => void regenerateTask(task.id)}
                              title="Перегенерировать эту задачу"
                            >
                              <RefreshCw size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ---------- Вспомогательные элементы ----------

/** Шапка вкладки: заголовок, кнопки настроек и магазина. Ребёнок выбирается в шапке дашборда. */
function MathHeader({ onOpenSettings, onOpenShop, onOpenAchievements }: { onOpenSettings?: () => void; onOpenShop?: () => void; onOpenAchievements?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-extrabold">🧮 Математика</h1>
      <div className="flex items-center gap-2">
        {onOpenSettings && (
          <button className="btn-secondary" onClick={onOpenSettings}>
            <Settings size={17} /> Настройки
          </button>
        )}
        {onOpenAchievements && (
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200"
            onClick={onOpenAchievements}
            title="Достижения"
          >
            <Trophy size={18} />
          </button>
        )}
        {onOpenShop && (
          <button className="btn-secondary" onClick={onOpenShop}>
            <ShoppingBag size={17} /> Магазин навыка
          </button>
        )}
      </div>
    </div>
  );
}
