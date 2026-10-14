import { Clock3 } from 'lucide-react';
import { ChildPurchaseDto } from '../../../../api/types';
import { fmtAmount, fmtDate } from '../../../../lib/format';
import { EmptyState } from '../../../ui';

interface Props {
  purchases: ChildPurchaseDto[];
}

const STATUS_META: Record<ChildPurchaseDto['status'], { label: string; cls: string }> = {
  PENDING: { label: 'Ожидает', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  PAID: { label: 'Оплачено', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  REJECTED: { label: 'Отказ', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export default function PurchaseHistoryTab({ purchases }: Props) {
  if (purchases.length === 0) {
    return (
      <EmptyState
        title="Покупок пока нет"
        hint="Запросы на покупку из магазина навыка появятся здесь"
      />
    );
  }

  return (
    <div className="rpg-panel overflow-x-auto">
      <table className="rpg-table w-full min-w-[520px]">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Магазин</th>
            <th>Дата</th>
            <th className="text-right">Сумма</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => {
            const meta = STATUS_META[p.status];
            return (
              <tr key={p.id}>
                <td className="font-semibold text-amber-100">{p.productName}</td>
                <td className="text-stone-300">{p.storeName}</td>
                <td className="text-stone-300">{fmtDate(p.createdAt)}</td>
                <td className="text-right font-bold text-amber-300">
                  {p.currencyIcon} {fmtAmount(p.amount, p.currencyName)}
                </td>
                <td>
                  <span className={`rpg-badge border ${meta.cls}`}>
                    {p.status === 'PENDING' && <Clock3 size={11} />}
                    {meta.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
