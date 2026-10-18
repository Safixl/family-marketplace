import { Package, ShoppingCart } from 'lucide-react';
import { ChildProductDto, StoreDto } from '../api/types';
import { fmtAmount } from '../lib/format';

interface StoreViewProps {
  store: StoreDto;
  products: ChildProductDto[];
  /** Остаток баланса магазина с учётом уже добавленного в корзину */
  balance: number | undefined;
  /** Сколько штук этого товара уже в корзине */
  cartCount: number;
  onAddToCart: (product: ChildProductDto) => void;
}

export default function StoreView({ store, products, balance, cartCount, onAddToCart }: StoreViewProps) {
  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <p className="theme-card rounded-2xl border border-dashed px-6 py-10 text-center text-sm theme-muted">
          В этом магазине пока нет товаров
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const limitReached =
              product.limitPerChild != null && product.boughtCount >= product.limitPerChild;
            const percent =
              product.limitPerChild != null
                ? Math.min(100, Math.round((product.boughtCount / product.limitPerChild) * 100))
                : 0;
            const notEnough = (balance ?? 0) < product.price;

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

                {product.description && <p className="theme-muted text-sm">{product.description}</p>}

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

                {limitReached ? (
                  <span className="badge justify-center bg-slate-100 py-2 text-slate-500">лимит исчерпан</span>
                ) : (
                  <button
                    className="theme-btn w-full rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={notEnough}
                    onClick={() => onAddToCart(product)}
                  >
                    <ShoppingCart size={16} />
                    {cartCount > 0 ? `В корзине: ${cartCount}` : 'В корзину'}
                  </button>
                )}
                {!limitReached && notEnough && (
                  <p className="-mt-2 text-center text-xs text-rose-600">Недостаточно средств</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}