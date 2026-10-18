import { useMemo, useState } from 'react';
import { ShoppingCart, Store, Trash2 } from 'lucide-react';
import { ChildProductDto, ChildProfileResponse, StoreDto } from '../../api/types';
import { api } from '../../api/client';
import { errMsg, fmtAmount } from '../../lib/format';
import StoreView from '../StoreView';
import { EmptyState, Spinner } from '../ui';

interface Props {
  stores: StoreDto[];
  products: ChildProductDto[];
  profile: ChildProfileResponse | null;
  loading: boolean;
  onPurchased: () => void;
}

interface CartLine {
  product: ChildProductDto;
  qty: number;
}

/**
 * «Магазины»: вкладки-фильтры слева (названия магазинов), справа — товары.
 * Ребёнок собирает корзину (пока хватает баллов), затем «Оплатить» с повторным
 * подтверждением. Покупка мгновенная, без подтверждения родителя.
 */
export default function ChildShopsTab({ stores, products, profile, loading, onPurchased }: Props) {
  const [activeStoreId, setActiveStoreId] = useState<number | null>(null);
  const [cart, setCart] = useState<Record<number, CartLine>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const balanceFor = (storeId: number) =>
    profile?.balances.find((b) => b.storeId === storeId)?.amount ?? 0;

  // Сколько уже потрачено в корзине по каждому магазину
  const spentByStore = useMemo(() => {
    const map: Record<number, number> = {};
    Object.values(cart).forEach((line) => {
      map[line.product.storeId] = (map[line.product.storeId] ?? 0) + line.product.price * line.qty;
    });
    return map;
  }, [cart]);

  const addToCart = (product: ChildProductDto) => {
    const spent = spentByStore[product.storeId] ?? 0;
    const balance = balanceFor(product.storeId);
    if (spent + product.price > balance) {
      alert('Недостаточно средств');
      return;
    }
    setCart((prev) => {
      const existing = prev[product.id];
      return { ...prev, [product.id]: { product, qty: (existing?.qty ?? 0) + 1 } };
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const cartLines = Object.values(cart);
  const cartTotal = cartLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  const pay = async () => {
    setBusy(true);
    try {
      for (const line of cartLines) {
        for (let i = 0; i < line.qty; i++) {
          await api.post('/child/purchases', { productId: line.product.id });
        }
      }
      setCart({});
      setConfirmOpen(false);
      onPurchased();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Открываем магазины…" />;

  if (stores.length === 0) {
    return (
      <EmptyState title="Магазины пока закрыты" hint="Загляни позже!" icon={<Store size={40} />} />
    );
  }

  const filtered = activeStoreId == null
    ? products
    : products.filter((p) => p.storeId === activeStoreId);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Вкладки-фильтры слева + корзина под ними */}
      <aside className="shrink-0 lg:w-64">
        <div className="rpg-panel rpg-panel-gold flex gap-1.5 overflow-x-auto p-2 lg:flex-col">
          <button
            onClick={() => setActiveStoreId(null)}
            className={`rpg-tab justify-start ${activeStoreId == null ? 'rpg-tab-active' : ''}`}
          >
            🛍️ Все магазины
          </button>
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => setActiveStoreId(store.id)}
              className={`rpg-tab justify-start ${activeStoreId === store.id ? 'rpg-tab-active' : ''}`}
            >
              {store.currencyIcon} {store.name}
            </button>
          ))}
        </div>

        {/* Корзина */}
        {cartLines.length > 0 && (
          <div className="rpg-panel rpg-panel-gold mt-3 space-y-3 p-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-amber-200">
              <ShoppingCart size={18} className="text-amber-400" /> Корзина
            </h3>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {cartLines.map((line) => (
                <div key={line.product.id} className="flex items-center gap-2 rounded-xl bg-stone-900/60 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-amber-100">
                      {line.product.name} ×{line.qty}
                    </div>
                    <div className="text-xs text-stone-400">
                      {line.product.currencyIcon} {fmtAmount(line.product.price * line.qty, line.product.currencyName)}
                    </div>
                  </div>
                  <button
                    className="rounded-lg p-1 text-stone-400 hover:bg-rose-500/20 hover:text-rose-300"
                    onClick={() => removeFromCart(line.product.id)}
                    title="Убрать"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-amber-500/20 pt-2 text-sm">
              <span className="text-stone-300">Итого</span>
              <span className="font-extrabold text-amber-300">{fmtAmount(cartTotal)}</span>
            </div>
            <button className="rpg-btn w-full" onClick={() => setConfirmOpen(true)}>
              <ShoppingCart size={15} /> Оплатить
            </button>
          </div>
        )}
      </aside>

      {/* Товары справа */}
      <div className="min-w-0 flex-1 space-y-4">
        {filtered.length === 0 ? (
          <EmptyState title="Товаров пока нет" hint="Загляни позже!" />
        ) : (
          <div className="space-y-6">
            {activeStoreId == null
              ? stores.map((store) => {
                  const storeProducts = products.filter((p) => p.storeId === store.id);
                  if (storeProducts.length === 0) return null;
                  return (
                    <section key={store.id}>
                      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-200">
                        <span className="text-xl">{store.currencyIcon}</span> {store.name}
                        <span className="ml-auto text-sm font-normal text-amber-200/60">
                          Баланс: {store.currencyIcon} {fmtAmount(balanceFor(store.id), store.currencyName)}
                        </span>
                      </h2>
                      <StoreView
                        store={store}
                        products={storeProducts}
                        balance={balanceFor(store.id) - (spentByStore[store.id] ?? 0)}
                        cartCount={0}
                        onAddToCart={addToCart}
                      />
                    </section>
                  );
                })
              : (() => {
                  const store = stores.find((s) => s.id === activeStoreId);
                  if (!store) return null;
                  return (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-200">
                        <span className="text-xl">{store.currencyIcon}</span> {store.name}
                        <span className="ml-auto text-sm font-normal text-amber-200/60">
                          Баланс: {store.currencyIcon} {fmtAmount(balanceFor(store.id), store.currencyName)}
                        </span>
                      </h2>
                      <StoreView
                        store={store}
                        products={filtered}
                        balance={balanceFor(store.id) - (spentByStore[store.id] ?? 0)}
                        cartCount={0}
                        onAddToCart={addToCart}
                      />
                    </section>
                  );
                })()}
          </div>
        )}
      </div>

      {/* Подтверждение оплаты */}
      {confirmOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="rpg-panel rpg-panel-gold w-full max-w-md p-5">
            <h3 className="mb-3 text-lg font-bold text-amber-100">Подтверди покупку</h3>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {cartLines.map((line) => (
                <div key={line.product.id} className="flex items-center justify-between rounded-xl bg-stone-900/60 px-3 py-2 text-sm">
                  <span className="text-amber-100">
                    {line.product.name} ×{line.qty}
                  </span>
                  <span className="font-bold text-amber-300">
                    {line.product.currencyIcon} {fmtAmount(line.product.price * line.qty, line.product.currencyName)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-amber-500/20 pt-2">
              <span className="text-stone-300">Итого</span>
              <span className="text-lg font-extrabold text-amber-300">{fmtAmount(cartTotal)}</span>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rpg-btn rpg-btn-ghost" onClick={() => setConfirmOpen(false)}>
                Отмена
              </button>
              <button className="rpg-btn" disabled={busy} onClick={() => void pay()}>
                Оплатить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
