import { useState } from 'react';
import { Clock3, Package, ShoppingCart } from 'lucide-react';
import { api } from '../api/client';
import { ChildProductDto, StoreDto } from '../api/types';
import { errMsg, fmtAmount } from '../lib/format';
import ChildHouseView from './child/ChildHouseView';
import ChildMathView from './child/ChildMathView';
import ChildReadingView from './child/ChildReadingView';

interface StoreViewProps {
  store: StoreDto;
  products: ChildProductDto[];
  balance: number | undefined;
  onPurchased: () => void;
}

export default function StoreView({ store, products, balance, onPurchased }: StoreViewProps) {
  const [busyId, setBusyId] = useState<number | null>(null);

  const buy = async (product: ChildProductDto) => {
    setBusyId(product.id);
    try {
      await api.post('/child/purchases', { productId: product.id });
      onPurchased();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="theme-card flex flex-wrap items-center gap-3 rounded-2xl border p-5 shadow-sm">
        <div className="theme-btn-soft flex h-12 w-12 items-center justify-center rounded-2xl text-2xl">
          {store.currencyIcon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">{store.name}</h2>
          {store.description && <p className="theme-muted text-sm">{store.description}</p>}
        </div>
        <div className="theme-btn-soft rounded-xl px-4 py-2 text-sm font-bold">
          Баланс: {store.currencyIcon} {fmtAmount(balance ?? 0, store.currencyName)}
        </div>
      </div>

      {store.templateType === 'READING' && <ChildReadingView store={store} />}
      {store.templateType === 'MATH' && <ChildMathView storeId={store.id} />}
      {store.templateType === 'HOME' && <ChildHouseView storeId={store.id} />}

      {products.length === 0 ? (
        <p className="theme-card rounded-2xl border border-dashed px-6 py-10 text-center text-sm theme-muted">
          В этом магазине пока нет товаров
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const disabled = product.hasPending || (balance ?? 0) < product.price;
            const limitReached =
              product.limitPerChild != null && product.boughtCount >= product.limitPerChild;
            const percent =
              product.limitPerChild != null
                ? Math.min(100, Math.round((product.boughtCount / product.limitPerChild) * 100))
                : 0;

            return (
              <div key={product.id} className="theme-card flex flex-col gap-3 rounded-2xl border p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="theme-btn-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                    <Package size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold leading-tight">{product.name}</div>
                    <div className="theme-accent-text mt-0.5 text-lg font-extrabold">
                      {store.currencyIcon} {fmtAmount(product.price, product.currencyName)}
                    </div>
                  </div>
                </div>

                {product.description && (
                  <p className="theme-muted text-sm">{product.description}</p>
                )}

                {product.limitPerChild != null && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>
                        Куплено: {product.boughtCount} из {product.limitPerChild}
                      </span>
                      {limitReached && <span className="font-semibold text-rose-600">лимит</span>}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${limitReached ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {product.hasPending ? (
                  <span className="badge justify-center bg-amber-100 py-2 text-amber-700">
                    <Clock3 size={14} /> Ожидает подтверждения
                  </span>
                ) : (
                  <button
                    className="theme-btn w-full rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled || busyId === product.id}
                    onClick={() => void buy(product)}
                  >
                    <ShoppingCart size={16} /> Купить
                  </button>
                )}
                {!product.hasPending && !limitReached && (balance ?? 0) < product.price && (
                  <p className="-mt-2 text-center text-xs text-rose-600">Недостаточно средств</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}