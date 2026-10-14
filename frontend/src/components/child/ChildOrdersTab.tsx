import { useCallback, useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { api } from '../../api/client';
import { ChildPurchaseDto } from '../../api/types';
import { errMsg, fmtAmount, fmtDate } from '../../lib/format';
import { EmptyState, Spinner, StatusBadge } from '../ui';

export default function ChildOrdersTab() {
  const [orders, setOrders] = useState<ChildPurchaseDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await api.get<ChildPurchaseDto[]>('/child/purchases'));
    } catch (e) {
      setError(errMsg(e));
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <div className="card text-sm text-rose-600">{error}</div>;

  if (orders === null) return <Spinner label="Загружаем заказы…" />;

  if (orders.length === 0) {
    return (
      <EmptyState
        title="Заказов пока нет"
        hint="Загляни в магазины и закажи что-нибудь!"
        icon={<Package size={40} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Мои заказы</h2>
        <span className="theme-muted text-xs">{orders.length} шт.</span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="theme-card flex flex-wrap items-center gap-3 rounded-2xl border p-4">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{order.productName}</div>
              <div className="theme-muted text-sm">
                {order.storeName} · {fmtDate(order.createdAt)}
                {order.confirmedAt && ` · обработан ${fmtDate(order.confirmedAt)}`}
              </div>
              <div className="theme-accent-text mt-0.5 text-sm font-bold">
                {order.currencyIcon} {fmtAmount(order.amount, order.currencyName)}
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
