import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, ChevronUp, Package, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { ProductDto, StoreDto, StoreTemplateDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import Modal from '../Modal';
import BooksManager from '../managers/BooksManager';
import HouseCalendar from '../managers/HouseCalendar';
import TaskCardsManager from '../managers/TaskCardsManager';
import TasksManager from '../managers/TasksManager';
import { EmptyState, Spinner } from '../ui';

interface StoreForm {
  name: string;
  description: string;
  currencyName: string;
  currencyIcon: string;
  active: boolean;
}

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

const EMPTY_STORE: StoreForm = { name: '', description: '', currencyName: 'монета', currencyIcon: '🪙', active: true };
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

export default function StoresTab() {
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [productsByStore, setProductsByStore] = useState<Record<number, ProductDto[]>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [templates, setTemplates] = useState<StoreTemplateDto[]>([]);
  const [templateModal, setTemplateModal] = useState(false);
  const [managerFor, setManagerFor] = useState<
    { store: StoreDto; type: 'books' | 'tasks' | 'house' | 'cards'; skill?: 'MATH' | 'HOUSE' } | null
  >(null);

  const [storeModal, setStoreModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreDto | null>(null);
  const [storeForm, setStoreForm] = useState<StoreForm>(EMPTY_STORE);

  const [productModal, setProductModal] = useState(false);
  const [productStoreId, setProductStoreId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storeList, templateList] = await Promise.all([
        api.get<StoreDto[]>('/parent/stores'),
        api.get<StoreTemplateDto[]>('/parent/store-templates'),
      ]);
      setStores(storeList);
      setTemplates(templateList);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activateTemplate = async (slug: string) => {
    setBusy(true);
    try {
      await api.post(`/parent/store-templates/${slug}/activate`);
      setTemplateModal(false);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const loadProducts = async (storeId: number) => {
    try {
      const products = await api.get<ProductDto[]>(`/parent/stores/${storeId}/products`);
      setProductsByStore((prev) => ({ ...prev, [storeId]: products }));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const toggleExpand = (storeId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) {
        next.delete(storeId);
      } else {
        next.add(storeId);
        void loadProducts(storeId);
      }
      return next;
    });
  };

  const openStoreCreate = () => {
    setEditingStore(null);
    setStoreForm(EMPTY_STORE);
    setStoreModal(true);
  };

  const openStoreEdit = (store: StoreDto) => {
    setEditingStore(store);
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
    if (!storeForm.name.trim()) {
      alert('Укажите название магазина');
      return;
    }
    setBusy(true);
    try {
      const body = {
        name: storeForm.name.trim(),
        description: storeForm.description.trim() || null,
        currencyName: storeForm.currencyName.trim() || 'монета',
        currencyIcon: storeForm.currencyIcon.trim() || '🪙',
        active: storeForm.active,
      };
      if (editingStore) {
        await api.put(`/parent/stores/${editingStore.id}`, body);
      } else {
        await api.post('/parent/stores', body);
      }
      setStoreModal(false);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const removeStore = async (store: StoreDto) => {
    if (!window.confirm(`Удалить магазин «${store.name}» со всеми товарами?`)) return;
    try {
      await api.del(`/parent/stores/${store.id}`);
      setStores((prev) => prev.filter((s) => s.id !== store.id));
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(store.id);
        return next;
      });
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const openProductCreate = (storeId: number) => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setProductStoreId(storeId);
    setProductModal(true);
  };

  const openProductEdit = (product: ProductDto, storeId: number) => {
    setEditingProduct(product);
    setProductStoreId(storeId);
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
    if (!productForm.name.trim()) {
      alert('Укажите название товара');
      return;
    }
    const price = Number(productForm.price);
    if (!price || price <= 0) {
      alert('Укажите цену больше нуля');
      return;
    }
    if (productStoreId == null) return;
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
        await api.post(`/parent/stores/${productStoreId}/products`, body);
      }
      setProductModal(false);
      await loadProducts(productStoreId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async (product: ProductDto, storeId: number) => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return;
    try {
      await api.del(`/parent/products/${product.id}`);
      await loadProducts(storeId);
    } catch (e) {
      alert(errMsg(e));
    }
  };

  if (loading) return <Spinner label="Загружаем магазины…" />;

  if (error) return <div className="card text-sm text-rose-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-extrabold">Магазины</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setTemplateModal(true)}>
            <Sparkles size={18} /> Из шаблона
          </button>
          <button className="btn-primary" onClick={openStoreCreate}>
            <Plus size={18} /> Создать магазин
          </button>
        </div>
      </div>

      {stores.length === 0 ? (
        <EmptyState
          title="Пока нет магазинов"
          hint="Создайте магазин с кастомной валютой и добавьте товары"
        />
      ) : (
        <div className="space-y-4">
          {stores.map((store) => {
            const products = productsByStore[store.id] ?? [];
            const isExpanded = expanded.has(store.id);
            return (
              <div key={store.id} className="card space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-2xl">
                    {store.currencyIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{store.name}</span>
                      {!store.active && (
                        <span className="badge bg-slate-200 text-slate-600">неактивен</span>
                      )}
                    </div>
                    {store.description && (
                      <div className="truncate text-sm text-slate-500">{store.description}</div>
                    )}
                    <div className="text-xs font-medium text-indigo-600">
                      Валюта: {store.currencyIcon} {store.currencyName}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleExpand(store.id)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      title={isExpanded ? 'Свернуть товары' : 'Показать товары'}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                      onClick={() => openStoreEdit(store)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      title="Редактировать магазин"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => void removeStore(store)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      title="Удалить магазин"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {store.templateType && (
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    {store.templateType === 'READING' && (
                      <button
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                        onClick={() => setManagerFor({ store, type: 'books' })}
                      >
                        <BookOpen size={14} /> Книги и чтение
                      </button>
                    )}
                    {store.templateType === 'MATH' && (
                      <button
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                        onClick={() => setManagerFor({ store, type: 'tasks' })}
                      >
                        <Sparkles size={14} /> Задачи и статистика
                      </button>
                    )}
                    {store.templateType === 'MATH' && (
                      <button
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                        onClick={() => setManagerFor({ store, type: 'cards', skill: 'MATH' })}
                      >
                        🎴 Карточки с заданиями
                      </button>
                    )}
                    {store.templateType === 'HOME' && (
                      <button
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                        onClick={() => setManagerFor({ store, type: 'house' })}
                      >
                        <CalendarDays size={14} /> Календарь домашних дел
                      </button>
                    )}
                    {store.templateType === 'HOME' && (
                      <button
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                        onClick={() => setManagerFor({ store, type: 'cards', skill: 'HOUSE' })}
                      >
                        🏠 Помощь по дому
                      </button>
                    )}
                  </div>
                )}

                {isExpanded && (
                  <div className="border-t border-slate-100 pt-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">
                        Товары ({products.length})
                      </span>
                      <button
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                        onClick={() => openProductCreate(store.id)}
                      >
                        <Plus size={14} /> Добавить товар
                      </button>
                    </div>
                    {products.length === 0 ? (
                      <p className="py-4 text-center text-sm text-slate-400">
                        Товаров пока нет — добавьте первый
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-start gap-3 rounded-xl border border-slate-200 p-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <Package size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate font-semibold">{product.name}</span>
                                {!product.active && (
                                  <span className="badge bg-slate-200 text-slate-600">скрыт</span>
                                )}
                              </div>
                              {product.description && (
                                <div className="truncate text-xs text-slate-500">{product.description}</div>
                              )}
                              <div className="mt-0.5 text-sm font-bold text-indigo-700">
                                {fmtAmount(product.price, store.currencyName)}
                              </div>
                              {product.limitPerChild != null && (
                                <div className="text-xs text-slate-500">
                                  лимит: {product.limitPerChild} шт./ребенок
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openProductEdit(product, store.id)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                                title="Редактировать"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => void removeProduct(product, store.id)}
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Модалка магазина */}
      {storeModal && (
        <Modal
          title={editingStore ? 'Редактировать магазин' : 'Новый магазин'}
          onClose={() => setStoreModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="label">Название</label>
              <input
                className="input"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                placeholder="Например, Магазин игрушек"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Описание</label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                placeholder="Чем тут торгуем?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Название валюты</label>
                <input
                  className="input"
                  value={storeForm.currencyName}
                  onChange={(e) => setStoreForm({ ...storeForm, currencyName: e.target.value })}
                  placeholder="звёздочки"
                />
              </div>
              <div>
                <label className="label">Иконка валюты</label>
                <input
                  className="input"
                  value={storeForm.currencyIcon}
                  onChange={(e) => setStoreForm({ ...storeForm, currencyIcon: e.target.value })}
                  placeholder="⭐"
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
      {productModal && productStoreId != null && (
        <Modal
          title={editingProduct ? 'Редактировать товар' : 'Новый товар'}
          onClose={() => setProductModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="label">Название</label>
              <input
                className="input"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Например, Лего-набор"
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
                Одноразовое — пополняет остаток на сегодня (можно больше лимита), постоянное — увеличивает
                базовый лимит на будущие дни/недели.
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

      {/* Модалка шаблонов */}
      {templateModal && (
        <Modal title="Готовые магазины" onClose={() => setTemplateModal(false)} wide>
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Включите готовый магазин — он создастся с валютой и товарами. Настроить можно в любой момент.
            </p>
            {templates.map((t) => {
              const already = stores.some((s) => s.templateType === t.type);
              return (
                <div key={t.slug} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-2xl">
                    {t.currencyIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{t.name}</div>
                    <p className="text-sm text-slate-500">{t.description}</p>
                    <div className="mt-1 text-xs font-medium text-indigo-600">
                      Валюта: {t.currencyIcon} {t.currencyName}
                    </div>
                  </div>
                  <button
                    className={already ? 'btn-secondary' : 'btn-primary'}
                    disabled={busy}
                    onClick={() => void activateTemplate(t.slug)}
                  >
                    {already ? 'Открыть' : 'Включить'}
                  </button>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* Менеджеры шаблонных магазинов */}
      {managerFor?.type === 'books' && (
        <BooksManager store={managerFor.store} onClose={() => setManagerFor(null)} />
      )}
      {managerFor?.type === 'tasks' && (
        <TasksManager store={managerFor.store} onClose={() => setManagerFor(null)} />
      )}
      {managerFor?.type === 'house' && (
        <HouseCalendar store={managerFor.store} onClose={() => setManagerFor(null)} />
      )}
      {managerFor?.type === 'cards' && managerFor.skill && (
        <TaskCardsManager store={managerFor.store} skill={managerFor.skill} onClose={() => setManagerFor(null)} />
      )}
    </div>
  );
}