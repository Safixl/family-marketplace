import { useCallback, useEffect, useState } from 'react';
import { Check, Clock3, PackageCheck, X } from 'lucide-react';
import { api } from '../api/client';
import { InventoryItemDto, PurchaseDto } from '../api/types';
import { errMsg, fmtDate } from '../lib/format';

interface Props {
  /** Идентификатор магазина — показываем только его заявки. */
  storeId: number;
  /** Колбэк после изменения (для обновления внешних данных). */
  onChanged?: () => void;
}

/**
 * Блок «Ожидают подтверждения» в магазине навыка:
 * покупки детей этого магазина и запросы на активацию его товаров.
 */
export default function PendingPurchasesCard({ storeId, onChanged }: Props) {
  const [purchases, setPurchases] = useState<PurchaseDto[]>([]);
  const [activations, setActivations] = useState<InventoryItemDto[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, a] = await Promise.all([
        api.get<PurchaseDto[]>('/parent/purchases?status=PENDING'),
        api.get<InventoryItemDto[]>('/parent/inventory/pending'),
      ]);
      setPurchases(p.filter((x) => x.storeId === storeId));
      setActivations(a.filter((x) => x.storeId === storeId));
    } catch (e) {
      alert(errMsg(e));
    }
  }, [storeId]);

  useEffect(() => {
    void load();
    // Живое обновление заявок
    const timer = setInterval(() => {
      void load();
    }, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const decidePurchase = async (id: number, action: 'approve' | 'reject') => {
    setBusy(true);
    try {
      await api.post(`/parent/purchases/${id}/${action}`);
      await load();
      onChanged?.();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const decideActivation = async (id: number, action: 'approve' | 'reject') => {
    setBusy(true);
    try {
      await api.post(`/parent/inventory/${id}/${action}`);
      await load();
      onChanged?.();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (purchases.length === 0 && activations.length === 0) return null;

  return (
    <div className="card border-amber-200 bg-amber-50/60">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
        <Clock3 size={16} /> Ожидают подтверждения
      </div>
      <div className="space-y-2">
        {purchases.map((p) => (
          <div key={`p-${p.id}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2">
            <div className="text-xl">{p.childAvatar}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                Покупка: {p.productName} <span className="text-xs font-normal text-slate-500">· {p.childName}</span>
              </div>
              <div className="text-xs text-slate-500">
                {p.currencyIcon} {p.amount} · {fmtDate(p.createdAt)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-success !px-3 !py-1.5"
                disabled={busy}
                onClick={() => void decidePurchase(p.id, 'approve')}
              >
                <Check size={16} /> Подтвердить
              </button>
              <button
                className="btn-secondary !px-3 !py-1.5"
                disabled={busy}
                onClick={() => void decidePurchase(p.id, 'reject')}
              >
                <X size={16} /> Отклонить
              </button>
            </div>
          </div>
        ))}
        {activations.map((a) => (
          <div key={`a-${a.id}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2">
            <div className="text-xl">
              <PackageCheck size={20} className="text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                Активация: {a.productName} <span className="text-xs font-normal text-slate-500">· {a.childName}</span>
              </div>
              <div className="text-xs text-slate-500">{fmtDate(a.createdAt)}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-success !px-3 !py-1.5"
                disabled={busy}
                onClick={() => void decideActivation(a.id, 'approve')}
              >
                <Check size={16} /> Активировать
              </button>
              <button
                className="btn-secondary !px-3 !py-1.5"
                disabled={busy}
                onClick={() => void decideActivation(a.id, 'reject')}
              >
                <X size={16} /> Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
