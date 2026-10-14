import { ReactNode } from 'react';
import { Loader2, PackageOpen } from 'lucide-react';
import { PurchaseStatus } from '../api/types';

export function Spinner({ label = 'Загрузка…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <Loader2 className="animate-spin text-indigo-600" size={28} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="text-slate-300">{icon ?? <PackageOpen size={40} />}</div>
      <p className="font-semibold text-slate-600">{title}</p>
      {hint && <p className="text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-2xl font-extrabold leading-tight">{value}</div>
        <div className="truncate text-xs font-medium text-slate-500">{label}</div>
      </div>
    </div>
  );
}

const STATUS_META: Record<PurchaseStatus, { label: string; className: string }> = {
  PENDING: { label: 'Ожидает', className: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Оплачено', className: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Отклонено', className: 'bg-rose-100 text-rose-700' },
};

export function StatusBadge({ status }: { status: PurchaseStatus }) {
  const meta = STATUS_META[status];
  return <span className={`badge ${meta.className}`}>{meta.label}</span>;
}