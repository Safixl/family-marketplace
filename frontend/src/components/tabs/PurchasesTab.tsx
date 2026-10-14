import { useCallback, useEffect, useState } from 'react';
import { Check, PackageCheck, X } from 'lucide-react';
import { api } from '../../api/client';
import { InventoryItemDto, PurchaseDto, PurchaseStatus } from '../../api/types';
import { errMsg, fmtAmount, fmtDate } from '../../lib/format';
import { EmptyState, Spinner, StatusBadge } from '../ui';

type Filter = 'ALL' | PurchaseStatus;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'ALL', label: 'Все' },
  { id: 'PENDING', label: 'Ожидают' },
  { id: 'PAID', label: 'Оплачены' },
  { id: 'REJECTED', label: 'Отклонены' },
];

export default function PurchasesTab() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [purchases, setPurchases] = useState<PurchaseDto[]>([]);
  const [activations, setActivations] = useState<InventoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = filter === 'ALL' ? '' : `?status=${filter}`;
      const [p, a] = await Promise.all([
        api.get<PurchaseDto[]>(`/parent/purchases${query}`),
        api.get<InventoryItemDto[]>('/parent/inventory/pending'),
      ]);
      setPurchases(p);
      setActivations(a);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (purchaseId: number, action: 'approve' | 'reject') => {
    setBusy(true);
    try {
      await api.post(`/parent/purchases/${purchaseId}/${action}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const decideActivation = async (itemId: number, action: 'approve' | 'reject') => {
    setBusy(true);
    try {
      await api.post(`/parent/inventory/${itemId}/${action}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Загружаем покупки…" />;

  if (error) return <div className="card text-sm text-rose-600">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">Покупки</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`tab-btn ${filter === f.id ? 'tab-active' : 'tab-inactive bg-white border border-slate-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Запросы на активацию товаров из инвентаря */}
      {activations.length > 0 && (
        <div className="card border-amber-200 bg-amber-50/60">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
            <PackageCheck size={16} /> Запросы на активацию товаров ({activations.length})
          </div>
          <div className="space-y-2">
            {activations.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2">
                <div className="text-xl">{item.childAvatar}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {item.productName}{' '}
                    <span className="text-xs font-normal text-slate-500">· {item.childName}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.storeName} · {fmtDate(item.createdAt)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-success !px-3 !py-1.5"
                    disabled={busy}
                    onClick={() => void decideActivation(item.id, 'approve')}
                  >
                    <Check size={16} /> Активировать
                  </button>
                  <button
                    className="btn-danger !px-3 !py-1.5"
                    disabled={busy}
                    onClick={() => void decideActivation(item.id, 'reject')}
                  >
                    <X size={16} /> Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {purchases.length === 0 ? (
        <EmptyState title="Покупок нет" hint="Заказы детей появятся здесь" />
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="card flex flex-wrap items-center gap-3">
              <div className="text-2xl">{purchase.childAvatar}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">
                  {purchase.productName}{' '}
                  <span className="text-sm font-normal text-slate-500">· {purchase.childName}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {purchase.storeName} · создан {fmtDate(purchase.createdAt)}
                  {purchase.confirmedAt && ` · обработан ${fmtDate(purchase.confirmedAt)}`}
                </div>
                <div className="mt-0.5 text-sm font-bold text-indigo-700">
                  {purchase.currencyIcon} {fmtAmount(purchase.amount, purchase.currencyName)}
                </div>
              </div>
              <StatusBadge status={purchase.status} />
              {purchase.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    className="btn-success !px-3 !py-1.5"
                    disabled={busy}
                    onClick={() => void decide(purchase.id, 'approve')}
                  >
                    <Check size={16} /> Подтвердить
                  </button>
                  <button
                    className="btn-danger !px-3 !py-1.5"
                    disabled={busy}
                    onClick={() => void decide(purchase.id, 'reject')}
                  >
                    <X size={16} /> Отклонить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}