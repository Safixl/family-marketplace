import { useState } from 'react';
import { Package, Sparkles } from 'lucide-react';
import { api } from '../../../../api/client';
import { InventoryStackDto } from '../../../../api/types';
import { errMsg, fmtAmount } from '../../../../lib/format';
import { EmptyState } from '../../../ui';

interface Props {
  inventory: InventoryStackDto[];
  onReload: () => void;
}

/**
 * Инвентарь навыка: неиспользованные покупки магазина, сгруппированные в стопки.
 * Статусов нет: после использования предмет исчезает, количество уменьшается.
 */
export default function InventoryTab({ inventory, onReload }: Props) {
  const [busyId, setBusyId] = useState<number | null>(null);

  const useItem = async (productId: number) => {
    setBusyId(productId);
    try {
      await api.post(`/child/inventory/${productId}/use`);
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
      {inventory.map((item) => (
        <div key={item.productId} className="rpg-panel flex flex-wrap items-center gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
            <Package size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-amber-100">
              {item.productName}
              {item.count > 1 && <span className="ml-2 text-sm text-amber-300">×{item.count}</span>}
            </div>
            <div className="text-sm text-stone-400">
              {item.storeName} · {item.currencyIcon} {fmtAmount(item.price, item.currencyName)}
            </div>
          </div>
          <button
            className="rpg-btn"
            disabled={busyId === item.productId}
            onClick={() => void useItem(item.productId)}
          >
            <Sparkles size={15} /> Использовать
          </button>
        </div>
      ))}
    </div>
  );
}
