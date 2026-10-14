import { useMemo, useState } from 'react';
import { Minus, Package, Send, ShoppingCart } from 'lucide-react';
import { api } from '../../../../api/client';
import { ChildProductDto, StoreDto } from '../../../../api/types';
import { errMsg, fmtAmount } from '../../../../lib/format';
import { EmptyState } from '../../../ui';

interface Props {
  store: StoreDto | null;
  products: ChildProductDto[];
  balance: number | undefined;
  onPurchased: () => void;
}

export default function ShopTab({ store, products, balance, onPurchased }: Props) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);

  const total = useMemo(() => {
    return products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * p.price, 0);
  }, [products, cart]);

  const add = (id: number) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: number) =>
    setCart((c) => {
      const next = { ...c };
      const count = (next[id] ?? 0) - 1;
      if (count <= 0) delete next[id];
      else next[id] = count;
      return next;
    });

  const submit = async () => {
    const entries = Object.entries(cart).filter(([, n]) => n > 0);
    if (entries.length === 0) {
      alert('Добавьте товары в корзину');
      return;
    }
    setBusy(true);
    try {
      for (const [productId, count] of entries) {
        for (let i = 0; i < count; i++) {
          await api.post('/child/purchases', { productId: Number(productId) });
        }
      }
      setCart({});
      onPurchased();
      alert('Запрос на покупку отправлен родителю!');
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (!store) {
    return (
      <EmptyState
        title="Магазин навыка пока не создан"
        hint="Родитель создаст магазин для этого направления — здесь появятся товары за баллы навыка"
        icon={<Package size={40} />}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="В магазине пока нет товаров"
        hint="Родитель добавит товары, доступные за баллы этого навыка"
        icon={<Package size={40} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-stone-300">
          Баланс навыка:{' '}
          <span className="font-bold text-amber-300">
            {store.currencyIcon} {fmtAmount(balance ?? 0, store.currencyName)}
          </span>
        </div>
        {Object.keys(cart).length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-300">
              Корзина: <span className="font-bold text-amber-300">{fmtAmount(total)}</span>
            </span>
            <button className="rpg-btn" disabled={busy} onClick={() => void submit()}>
              <Send size={16} /> Отправить запрос на покупку
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const count = cart[product.id] ?? 0;
          const limitReached =
            product.limitPerChild != null && product.boughtCount >= product.limitPerChild;
          return (
            <div key={product.id} className="rpg-panel flex flex-col gap-3 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                  <Package size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold leading-tight text-amber-100">{product.name}</div>
                  <div className="mt-0.5 text-lg font-extrabold text-amber-300">
                    {store.currencyIcon} {fmtAmount(product.price, product.currencyName)}
                  </div>
                </div>
              </div>

              {product.description && (
                <p className="text-sm text-stone-400">{product.description}</p>
              )}

              {product.limitPerChild != null && (
                <div className="text-xs text-stone-400">
                  Куплено: {product.boughtCount} из {product.limitPerChild}
                  {limitReached && <span className="ml-1 font-bold text-rose-400">· лимит</span>}
                </div>
              )}

              {product.hasPending ? (
                <span className="rpg-badge justify-center border border-amber-500/30 bg-amber-500/15 py-1.5 text-amber-300">
                  Ожидает подтверждения
                </span>
              ) : limitReached ? (
                <span className="rpg-badge justify-center border border-rose-500/30 bg-rose-500/15 py-1.5 text-rose-300">
                  Лимит исчерпан
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <button className="rpg-btn rpg-btn-ghost !px-2.5" onClick={() => remove(product.id)}>
                      <Minus size={15} />
                    </button>
                  )}
                  {count > 0 && (
                    <span className="w-6 text-center font-bold text-amber-200">{count}</span>
                  )}
                  <button
                    className="rpg-btn flex-1"
                    disabled={busy || (balance ?? 0) < product.price}
                    onClick={() => add(product.id)}
                  >
                    <ShoppingCart size={15} /> {count > 0 ? 'Ещё раз' : 'В корзину'}
                  </button>
                </div>
              )}
              {!product.hasPending && !limitReached && (balance ?? 0) < product.price && (
                <p className="-mt-1 text-center text-xs text-rose-400">Недостаточно баллов</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
