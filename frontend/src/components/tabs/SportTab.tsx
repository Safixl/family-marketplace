import { useCallback, useEffect, useState } from 'react';
import { Check, Pencil, Plus, Save, ShoppingBag, Trophy, Trash2, X } from 'lucide-react';
import { api } from '../../api/client';
import {
  ProductDto,
  SportCardReviewDto,
  SportDirectionFullDto,
  SportRequestDto,
  SportTaskDto,
  StoreDto,
} from '../../api/types';
import { errMsg } from '../../lib/format';
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

type Panel = 'requests' | 'directions' | 'reviews';

interface Props {
  /** Ребёнок, выбранный в шапке дашборда — чьи направления и дейлики управляем. */
  selectedChildId?: number | null;
}

/**
 * Вкладка «Спорт и хобби»: запросы ребёнка на новые направления, редактор
 * направлений и заданий, проверка дейликов с множителем ×0/×1/×2 и магазин навыка.
 */
export default function SportTab({ selectedChildId }: Props) {
  const childId = selectedChildId != null ? String(selectedChildId) : '';

  // Базовые данные
  const [store, setStore] = useState<StoreDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Данные навыка
  const [panel, setPanel] = useState<Panel>('requests');
  const [requests, setRequests] = useState<SportRequestDto[]>([]);
  const [directions, setDirections] = useState<SportDirectionFullDto[] | null>(null);
  const [selectedDir, setSelectedDir] = useState<number | null>(null);
  const [tasks, setTasks] = useState<SportTaskDto[]>([]);
  const [reviews, setReviews] = useState<SportCardReviewDto[]>([]);
  const [newDirName, setNewDirName] = useState('');
  const [newDirIcon, setNewDirIcon] = useState('🎯');
  const [newTask, setNewTask] = useState({ title: '', description: '', gradeMin: 1, gradeMax: 8 });

  // Магазин навыка
  const [view, setView] = useState<'main' | 'shop' | 'achievements'>('main');
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
        const storeList = await api.get<StoreDto[]>('/parent/stores');
        setStore(storeList.find((s) => s.templateType === 'SPORT') ?? null);
      } catch (e) {
        alert(errMsg(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      setRequests(await api.get<SportRequestDto[]>('/parent/sport-requests'));
    } catch {
      setRequests([]);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      setReviews(await api.get<SportCardReviewDto[]>('/parent/sport-card-reviews'));
    } catch {
      setReviews([]);
    }
  }, []);

  const loadDirections = useCallback(async () => {
    if (!childId) {
      setDirections([]);
      return;
    }
    try {
      setDirections(await api.get<SportDirectionFullDto[]>(`/parent/sport-directions-list?childId=${childId}`));
    } catch {
      setDirections([]);
    }
  }, [childId]);

  const loadTasks = useCallback(async (directionId: number) => {
    try {
      setTasks(await api.get<SportTaskDto[]>(`/parent/sport-directions/${directionId}/tasks`));
    } catch {
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    if (!childId) {
      setDirections(null);
      return;
    }
    void loadDirections();
    void loadRequests();
    void loadReviews();
    // Живое обновление запросов ребёнка
    const timer = setInterval(() => {
      void loadRequests();
      void loadReviews();
    }, 15000);
    return () => clearInterval(timer);
  }, [childId, loadDirections, loadRequests, loadReviews]);

  useEffect(() => {
    if (selectedDir != null) void loadTasks(selectedDir);
  }, [selectedDir, loadTasks]);

  // ---------- Запросы ----------

  const createFromRequest = async (r: SportRequestDto, name: string, icon: string) => {
    setBusy(true);
    try {
      await api.post('/parent/sport-directions', { childId: r.childId, name, icon, requestId: r.requestId });
      await Promise.all([loadRequests(), loadDirections()]);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const rejectRequest = async (requestId: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/sport-requests/${requestId}/reject`);
      await loadRequests();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Направления и задания ----------

  const createDirection = async () => {
    if (!childId || !newDirName.trim()) return;
    setBusy(true);
    try {
      await api.post('/parent/sport-directions', { childId: Number(childId), name: newDirName, icon: newDirIcon });
      setNewDirName('');
      await loadDirections();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const addTask = async () => {
    if (selectedDir == null || !newTask.title.trim()) return;
    setBusy(true);
    try {
      await api.post('/parent/sport-tasks', { directionId: selectedDir, ...newTask });
      setNewTask({ title: '', description: '', gradeMin: 1, gradeMax: 8 });
      await loadTasks(selectedDir);
      await loadDirections();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const updateTask = async (t: SportTaskDto) => {
    setBusy(true);
    try {
      await api.put(`/parent/sport-tasks/${t.id}`, {
        directionId: t.directionId,
        title: t.title,
        description: t.description,
        gradeMin: t.gradeMin,
        gradeMax: t.gradeMax,
      });
      await loadTasks(t.directionId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    setBusy(true);
    try {
      await api.del(`/parent/sport-tasks/${taskId}`);
      await Promise.all([loadTasks(selectedDir ?? 0), loadDirections()]);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const patchTask = (id: number, next: Partial<SportTaskDto>) => {
    setTasks((prev) => (prev ?? []).map((t) => (t.id === id ? { ...t, ...next } : t)));
  };

  // ---------- Проверка дейликов ----------

  const review = async (cardId: number, multiplier: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/sport-card-reviews/${cardId}/review`, { multiplier });
      await loadReviews();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Магазин навыка ----------

  const openShop = () => {
    if (store) {
      api
        .get<ProductDto[]>(`/parent/stores/${store.id}/products`)
        .then(setProducts)
        .catch((e) => alert(errMsg(e)));
    }
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

  if (loading) return <Spinner label="Загружаем навык спорта…" />;

  if (!childId) {
    return <EmptyState title="Ребёнок не выбран" hint="Выберите ребёнка в шапке, чтобы управлять его направлениями" />;
  }

  if (!store) {
    return (
      <div className="space-y-4">
        <SportHeader />

        <EmptyState title="Магазин спорта не найден" hint="Включите шаблон «Спорт и хобби» в профиле ребёнка" />
      </div>
    );
  }

  // ===== Вид достижений навыка =====
  if (view === 'achievements') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setView('main')}>
            К спорту
          </button>
          <h1 className="text-xl font-extrabold">🏆 Достижения</h1>
        </div>
        <AchievementsTab skill="SPORT" selectedChildId={selectedChildId} />
      </div>
    );
  }

  // ===== Вид магазина навыка =====
  if (view === 'shop') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setView('main')}>
            К спорту
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
                        {product.price} {store.currencyName}
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
  const panelBtn = (id: Panel, label: string) => (
    <button key={id} onClick={() => setPanel(id)} className={panel === id ? 'btn-primary !px-3 !py-1.5 text-xs' : 'btn-secondary !px-3 !py-1.5 text-xs'}>
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <SportHeader onOpenShop={openShop} onOpenAchievements={() => setView('achievements')} />

      {/* Переключатель панелей */}
      <div className="flex flex-wrap gap-1.5">
        {panelBtn('requests', `📨 Запросы${requests.length ? ` (${requests.length})` : ''}`)}
        {panelBtn('directions', '🧭 Направления и задания')}
        {panelBtn('reviews', `🔍 Проверка дейликов${reviews.length ? ` (${reviews.length})` : ''}`)}
      </div>

      {/* Запросы на новые направления */}
      {panel === 'requests' &&
        (requests.length === 0 ? (
          <EmptyState title="Новых запросов от ребёнка нет" hint="Когда ребёнок попросит новое направление — оно появится здесь" />
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Ребёнок просит новое направление. Создайте его (до 6 направлений всего) и добавьте задания,
              чтобы построить путь к новому увлечению.
            </p>
            {requests.map((r) => (
              <div key={r.requestId} className="card space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl">{r.childAvatar}</span>
                  <span className="font-semibold text-slate-800">
                    {r.childName} хочет: {r.name}
                  </span>
                </div>
                {r.comment && <div className="text-sm text-slate-500">«{r.comment}»</div>}
                <div className="flex flex-wrap items-center gap-2">
                  <input className="input !w-16 text-center" value={r.childAvatar} disabled />
                  <input
                    className="input !w-40"
                    defaultValue={r.name}
                    onChange={(e) => {
                      r.name = e.target.value;
                    }}
                  />
                  <button
                    className="btn-primary !px-3 !py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => void createFromRequest(r, r.name, '🎯')}
                  >
                    <Check size={14} /> Создать направление
                  </button>
                  <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void rejectRequest(r.requestId)}>
                    <X size={14} /> Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Направления и задания */}
      {panel === 'directions' &&
        (directions === null ? (
          <Spinner label="Загружаем направления…" />
        ) : (
          <div className="card space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              {directions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDir(d.id)}
                  className={selectedDir === d.id ? 'btn-primary !px-3 !py-1.5 text-xs' : 'btn-secondary !px-3 !py-1.5 text-xs'}
                >
                  {d.icon} {d.name} ({d.taskCount})
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <input className="input !w-14 text-center" value={newDirIcon} onChange={(e) => setNewDirIcon(e.target.value.slice(0, 2))} />
              <input
                className="input !w-52"
                placeholder="Новое направление…"
                value={newDirName}
                onChange={(e) => setNewDirName(e.target.value)}
              />
              <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy || !newDirName.trim()} onClick={() => void createDirection()}>
                <Plus size={14} /> Добавить
              </button>
            </div>

            {selectedDir != null && (
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-700">Задания направления</div>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <input
                    className="input !w-56"
                    placeholder="Например: Отожмись 15 раз"
                    value={newTask.title}
                    onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  />
                  <input
                    className="input !w-64"
                    placeholder="Описание (техника, советы)"
                    value={newTask.description}
                    onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    Класс от
                    <input
                      type="number"
                      min={1}
                      max={8}
                      className="input !w-14 text-center"
                      value={newTask.gradeMin}
                      onChange={(e) => setNewTask((p) => ({ ...p, gradeMin: Number(e.target.value) || 1 }))}
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    до
                    <input
                      type="number"
                      min={1}
                      max={8}
                      className="input !w-14 text-center"
                      value={newTask.gradeMax}
                      onChange={(e) => setNewTask((p) => ({ ...p, gradeMax: Number(e.target.value) || 8 }))}
                    />
                  </label>
                  <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy || !newTask.title.trim()} onClick={() => void addTask()}>
                    <Plus size={14} /> Добавить
                  </button>
                </div>
                {tasks.length === 0 ? (
                  <EmptyState title="Заданий пока нет" hint="Добавьте первое задание направления" />
                ) : (
                  <div className="space-y-1.5">
                    {tasks.map((t) => (
                      <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <input className="input !w-60 text-sm" value={t.title} onChange={(e) => patchTask(t.id, { title: e.target.value })} />
                          <input className="input !w-64 text-sm" value={t.description} onChange={(e) => patchTask(t.id, { description: e.target.value })} />
                          <label className="text-xs text-slate-500">
                            {t.gradeMin}–{t.gradeMax} кл.
                          </label>
                          <button className="btn-primary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => void updateTask(t)} title="Сохранить">
                            <Save size={13} />
                          </button>
                          <button className="btn-secondary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => void deleteTask(t.id)} title="Удалить">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

      {/* Проверка дейликов */}
      {panel === 'reviews' &&
        (reviews.length === 0 ? (
          <EmptyState title="Дейликов на проверке нет" hint="Когда ребёнок выполнит дейлик — он появится здесь" />
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Проверь выполнение: ×0 — отклонить, ×1 — зачесть, ×2 — двойная награда.
            </p>
            {reviews.map((r) => (
              <div key={r.cardId} className="card space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl">{r.childAvatar}</span>
                  <span className="font-semibold text-slate-800">
                    {r.childName} · {r.directionIcon} {r.directionName}
                  </span>
                  <span className="text-xs text-slate-400">база: {r.baseReward} XP</span>
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  {r.taskTitles.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap justify-end gap-2">
                  <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 0)}>
                    <X size={14} /> ×0 Отклонить
                  </button>
                  <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 1)}>
                    <Check size={14} /> ×1 Зачесть
                  </button>
                  <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 2)}>
                    <Check size={14} /> ×2 Двойная
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

// ---------- Вспомогательные элементы ----------

/** Шапка вкладки: заголовок и кнопка магазина навыка. */
function SportHeader({ onOpenShop, onOpenAchievements }: { onOpenShop?: () => void; onOpenAchievements?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-extrabold">⚽ Спорт и хобби</h1>
      {onOpenShop && (
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200"
            onClick={onOpenAchievements}
            title="Достижения"
          >
            <Trophy size={18} />
          </button>
                  <button className="btn-secondary" onClick={onOpenShop}>
          <ShoppingBag size={17} /> Магазин навыка
        </button>
        </div>
      )}
    </div>
  );
}
