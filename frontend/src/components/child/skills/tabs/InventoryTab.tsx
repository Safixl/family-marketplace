import { useState } from 'react';
import { Clock3, Package, Sparkles } from 'lucide-react';
import { api } from '../../../../api/client';
import { InventoryItemDto } from '../../../../api/types';
import { errMsg, fmtAmount, fmtDate } from '../../../../lib/format';
import { EmptyState } from '../../../ui';

interface Props {
  inventory: InventoryItemDto[];
  onReload: () => void;
}

const STATUS_META: Record<InventoryItemDto['status'], { label: string; cls: string }> = {
  AVAILABLE: { label: 'Доступен', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  ACTIVATION_PENDING: { label: 'Запрос на активацию', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  ACTIVATED: { label: 'Активирован', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
};

export default function InventoryTab({ inventory, onReload }: Props) {
  const [busyId, setBusyId] = useState<number | null>(null);

  const activate = async (id: number) => {
    setBusyId(id);
    try {
      await api.post(`/child/inventory/${id}/activate`);
      onReload();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusyId(null);
    }
  };

  if (inventory.length === 0) {
    return (
      <EmptyState
        title="Инвентарь пуст"
        hint="Купленные, но ещё не использованные товары появятся здесь"
        icon={<Package size={40} />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {inventory.map((item) => {
        const meta = STATUS_META[item.status];
        return (
          <div key={item.id} className="rpg-panel flex flex-wrap items-center gap-3 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
              <Package size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-amber-100">{item.productName}</div>
              <div className="text-sm text-stone-400">
                {item.storeName} · {fmtDate(item.createdAt)}
              </div>
              <div className="mt-0.5 text-sm font-bold text-amber-300">
                {item.currencyIcon} {fmtAmount(item.price, item.currencyName)}
              </div>
            </div>
            <span className={`rpg-badge border ${meta.cls}`}>
              {item.status === 'ACTIVATION_PENDING' && <Clock3 size={11} />}
              {meta.label}
            </span>
            {item.status === 'AVAILABLE' && (
              <button
                className="rpg-btn"
                disabled={busyId === item.id}
                onClick={() => void activate(item.id)}
              >
                <Sparkles size={15} /> Активировать товар
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
