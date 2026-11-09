import { useCallback, useEffect, useState } from 'react';
import { Check, Pencil, Plus, Save, ShoppingBag, Trophy, Trash2, X } from 'lucide-react';
import { api } from '../../api/client';
import {
  LangCardReviewDto,
  LangCardSettingDto,
  LangDifficulty,
  LangParentVocabWord,
  ProductDto,
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

const DIFF_LABELS: Record<LangDifficulty, string> = {
  EASY: 'Легкая 🟢',
  MEDIUM: 'Обычная ⚪',
  HARD: 'Сложная 🔴',
};

type Panel = 'tasks' | 'vocab' | 'reviews';

interface Props {
  /** Ребёнок, выбранный в шапке дашборда — чьи настройки и словарь управляем. */
  selectedChildId?: number | null;
}

/**
 * Вкладка «Иностранный язык»: время и сложность для 6 видов заданий,
 * словарь (активация слов до 50 одновременно), проверка ручных заданий
 * с множителем ×0/×1/×2 и магазин навыка.
 */
export default function LangTab({ selectedChildId }: Props) {
  const childId = selectedChildId != null ? String(selectedChildId) : '';

  // Базовые данные
  const [store, setStore] = useState<StoreDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Данные навыка
  const [panel, setPanel] = useState<Panel>('tasks');
  const [settings, setSettings] = useState<LangCardSettingDto[] | null>(null);
  const [vocab, setVocab] = useState<LangParentVocabWord[] | null>(null);
  const [reviews, setReviews] = useState<LangCardReviewDto[]>([]);
  const [filter, setFilter] = useState('');

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
        setStore(storeList.find((s) => s.templateType === 'LANG') ?? null);
      } catch (e) {
        alert(errMsg(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setSettings(await api.get<LangCardSettingDto[]>('/parent/lang-card-settings'));
    } catch (e) {
      alert(errMsg(e));
      setSettings([]);
    }
  }, []);

  const loadVocab = useCallback(async () => {
    if (!childId) {
      setVocab([]);
      return;
    }
    try {
      setVocab(await api.get<LangParentVocabWord[]>(`/parent/lang-vocab?childId=${childId}`));
    } catch {
      setVocab([]);
    }
  }, [childId]);

  const loadReviews = useCallback(async () => {
    try {
      setReviews(await api.get<LangCardReviewDto[]>('/parent/lang-card-reviews'));
    } catch {
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    if (!childId) {
      setVocab(null);
      return;
    }
    void loadSettings();
    void loadVocab();
    void loadReviews();
    // Живое обновление проверок
    const timer = setInterval(() => {
      void loadReviews();
    }, 15000);
    return () => clearInterval(timer);
  }, [childId, loadSettings, loadVocab, loadReviews]);

  // ---------- Настройки ----------

  const patch = (taskType: string, next: Partial<LangCardSettingDto>) => {
    setSettings((prev) => (prev ?? []).map((s) => (s.taskType === taskType ? { ...s, ...next } : s)));
  };

  const save = async () => {
    if (!settings) return;
    setBusy(true);
    try {
      const items = settings.map((s) => ({
        taskType: s.taskType,
        minutes: s.minutes,
        difficulty: s.difficulty,
      }));
      await api.put('/parent/lang-card-settings', { items });
      await loadSettings();
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Словарь ----------

  const activate = async (wordId: number) => {
    if (!childId) return;
    setBusy(true);
    try {
      await api.post(`/parent/lang-vocab/${wordId}/activate?childId=${childId}`);
      await loadVocab();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const markLearned = async (wordId: number) => {
    if (!childId) return;
    setBusy(true);
    try {
      await api.post(`/parent/lang-vocab/${wordId}/mark-learned?childId=${childId}`);
      await loadVocab();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Проверка заданий ----------

  const review = async (cardId: number, multiplier: number) => {
    setBusy(true);
    try {
      await api.post(`/parent/lang-card-reviews/${cardId}/review`, { multiplier });
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

  if (loading) return <Spinner label="Загружаем навык языка…" />;

  if (!childId) {
    return <EmptyState title="Ребёнок не выбран" hint="Выберите ребёнка в шапке, чтобы управлять его словарём" />;
  }

  if (!store) {
    return (
      <div className="space-y-4">
        <LangHeader />

        <EmptyState title="Магазин языка не найден" hint="Включите шаблон «Иностранный язык» в профиле ребёнка" />
      </div>
    );
  }

  // ===== Вид достижений навыка =====
  if (view === 'achievements') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setView('main')}>
            К языку
          </button>
          <h1 className="text-xl font-extrabold">🏆 Достижения</h1>
        </div>
        <AchievementsTab skill="LANG" selectedChildId={selectedChildId} />
      </div>
    );
  }

  // ===== Вид магазина навыка =====
  if (view === 'shop') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setView('main')}>
            К языку
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
  const activeCount = (vocab ?? []).filter((w) => w.status === 'ACTIVE').length;
  const filteredVocab = (vocab ?? []).filter(
    (w) => !filter || w.foreign.toLowerCase().includes(filter.toLowerCase()) || w.ru.toLowerCase().includes(filter.toLowerCase()),
  );

  const panelBtn = (id: Panel, label: string) => (
    <button key={id} onClick={() => setPanel(id)} className={panel === id ? 'btn-primary !px-3 !py-1.5 text-xs' : 'btn-secondary !px-3 !py-1.5 text-xs'}>
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <LangHeader onOpenShop={openShop} onOpenAchievements={() => setView('achievements')} />

      {/* Переключатель панелей */}
      <div className="flex flex-wrap gap-1.5">
        {panelBtn('tasks', '⏱ Время и сложность')}
        {panelBtn('vocab', `📖 Словарь (${activeCount}/50)`)}
        {panelBtn('reviews', `🔍 Проверка заданий${reviews.length ? ` (${reviews.length})` : ''}`)}
      </div>

      {/* Время и сложность */}
      {panel === 'tasks' &&
        (settings === null ? (
          <Spinner label="Загружаем настройки…" />
        ) : (
          <div className="card space-y-3 p-4">
            <p className="text-sm text-slate-500">
              Для каждого вида заданий задаётся время на карточку и сложность — от сложности зависит,
              какие слова попадаются ребёнку (от самых нужных к более редким) и размер награды.
            </p>
            {settings.map((s) => (
              <div key={s.taskType} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800">
                    {s.emoji} {s.label} {s.manual && <span className="text-xs text-slate-400">· проверяет родитель</span>}
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-500">
                  Мин:
                  <input
                    type="number"
                    min={5}
                    max={120}
                    className="input !w-20 text-right"
                    value={s.minutes}
                    onChange={(e) => patch(s.taskType, { minutes: Number(e.target.value) || s.minutes })}
                  />
                </label>
                <select
                  className="input !w-auto text-sm"
                  value={s.difficulty}
                  onChange={(e) => patch(s.taskType, { difficulty: e.target.value as LangDifficulty })}
                >
                  {(Object.keys(DIFF_LABELS) as LangDifficulty[]).map((d) => (
                    <option key={d} value={d}>
                      {DIFF_LABELS[d]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex items-center justify-end gap-2">
              {settingsSaved && <span className="badge bg-emerald-100 text-emerald-700">Сохранено ✓</span>}
              <button className="btn-primary" onClick={() => void save()} disabled={busy || settings === null}>
                <Save size={16} /> Сохранить
              </button>
            </div>
          </div>
        ))}

      {/* Словарь */}
      {panel === 'vocab' &&
        (vocab === null ? (
          <Spinner label="Загружаем словарь…" />
        ) : (
          <div className="card space-y-3 p-4">
            <p className="text-sm text-slate-500">
              Слова упорядочены от самых нужных к менее важным. Активированные слова появляются в заданиях.
              Слово считается изученным после 50 верных ответов подряд. Максимум 50 слов одновременно —
              новое активируется автоматически после изучения предыдущего.
            </p>
            <input className="input w-full" placeholder="Поиск слова…" value={filter} onChange={(e) => setFilter(e.target.value)} />
            {filteredVocab.length === 0 ? (
              <EmptyState title="Слов не найдено" hint="Измените поиск" />
            ) : (
              <div className="max-h-[480px] space-y-1.5 overflow-y-auto">
                {filteredVocab.map((w) => (
                  <div
                    key={w.wordId}
                    className={`flex flex-wrap items-center gap-2 rounded-xl border p-2.5 text-sm ${
                      w.status === 'LEARNED'
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : w.status === 'ACTIVE'
                          ? 'border-sky-200 bg-sky-50/60'
                          : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-xs text-slate-400">#{w.sortOrder}</span>
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-800">{w.foreign}</span>
                      <span className="mx-2 text-slate-400">—</span>
                      <span className="text-slate-600">{w.ru}</span>
                    </span>
                    {w.status === 'ACTIVE' && (
                      <span className="text-xs text-sky-600">серия {w.streak}/{w.streakTarget}</span>
                    )}
                    {w.status === 'LEARNED' ? (
                      <span className="badge bg-emerald-100 text-emerald-700">✅ Изучил</span>
                    ) : w.status === 'ACTIVE' ? (
                      <>
                        <span className="text-xs text-slate-400">изучает</span>
                        <button
                          className="btn-secondary !px-2.5 !py-1 text-xs"
                          disabled={busy}
                          onClick={() => void markLearned(w.wordId)}
                        >
                          Отметить «изучил»
                        </button>
                      </>
                    ) : (
                      <button className="btn-primary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => void activate(w.wordId)}>
                        Активировать
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

      {/* Проверка заданий */}
      {panel === 'reviews' &&
        (reviews.length === 0 ? (
          <EmptyState title="Ручных заданий на проверке нет" hint="Когда ребёнок выполнит задание с ручной проверкой — оно появится здесь" />
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Оцените задание: ×0 — отклонить, ×1 — зачесть, ×2 — зачесть с двойной наградой.
              Множитель применяется ко всем наградам задания.
            </p>
            {reviews.map((r) => (
              <div key={r.cardId} className="card space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl">{r.childAvatar}</span>
                  <span className="font-semibold text-slate-800">
                    {r.childName} · {r.taskTypeEmoji} {r.taskTypeLabel}
                  </span>
                  <span className="text-xs text-slate-400">базовая награда: {r.baseReward} XP</span>
                </div>
                <div className="space-y-2">
                  {r.taskTexts.map((t, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-2.5 text-sm">
                      <div className="whitespace-pre-line text-slate-700">{t}</div>
                      <div className="mt-1.5 whitespace-pre-line rounded-lg bg-white p-2 text-slate-800">
                        <span className="text-xs font-bold text-slate-400">ОТВЕТ РЕБЁНКА:</span>
                        <br />
                        {r.childAnswers[i] || <span className="italic text-slate-400">— нет ответа —</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button className="btn-secondary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 0)}>
                    <X size={14} /> ×0 Отклонить
                  </button>
                  <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 1)}>
                    <Check size={14} /> ×1 Зачесть
                  </button>
                  <button className="btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void review(r.cardId, 2)}>
                    <Check size={14} /> ×2 Двойная награда
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
function LangHeader({ onOpenShop, onOpenAchievements }: { onOpenShop?: () => void; onOpenAchievements?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-extrabold">🌍 Иностранный язык</h1>
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
