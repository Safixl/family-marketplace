import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, Minus, Plus, ShoppingCart, Store, Users, X } from 'lucide-react';
import { api } from '../../api/client';
import { BalanceRowDto, ChildDto, MathStatsDto, PurchaseDto, ReadingStatsDto, StoreDto } from '../../api/types';
import { errMsg, fmtAmount, fmtDate } from '../../lib/format';
import { EmptyState, Spinner, StatCard, StatusBadge } from '../ui';

interface ChildProgress {
  reading: ReadingStatsDto | null;
  math: MathStatsDto | null;
}

export default function OverviewTab() {
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [purchases, setPurchases] = useState<PurchaseDto[]>([]);
  const [balances, setBalances] = useState<BalanceRowDto[]>([]);
  const [progress, setProgress] = useState<Record<number, ChildProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, s, p, b] = await Promise.all([
        api.get<ChildDto[]>('/parent/children'),
        api.get<StoreDto[]>('/parent/stores'),
        api.get<PurchaseDto[]>('/parent/purchases'),
        api.get<BalanceRowDto[]>('/parent/balances'),
      ]);
      setChildren(c);
      setStores(s);
      setPurchases(p);
      setBalances(b);

      const active = c.filter((child) => child.active);
      const entries = await Promise.all(
        active.map(async (child) => {
          const [reading, math] = await Promise.all([
            api.get<ReadingStatsDto>(`/parent/children/${child.id}/reading`).catch(() => null),
            api.get<MathStatsDto>(`/parent/children/${child.id}/math-stats`).catch(() => null),
          ]);
          return [child.id, { reading, math }] as const;
        }),
      );
      setProgress(Object.fromEntries(entries));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const adjust = async (row: BalanceRowDto, delta: number) => {
    setBusy(true);
    try {
      await api.post<BalanceRowDto>('/parent/balances/adjust', {
        childId: row.childId,
        storeId: row.storeId,
        delta,
      });
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

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

  if (loading) return <Spinner label="Загружаем обзор…" />;

  if (error) {
    return <div className="card text-sm text-rose-600">{error}</div>;
  }

  const pending = purchases.filter((p) => p.status === 'PENDING');
  const activeChildren = children.filter((c) => c.active);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Детей"
          value={activeChildren.length}
          icon={<Users size={22} />}
          accent="bg-gradient-to-br from-indigo-500 to-violet-600"
        />
        <StatCard
          label="Магазинов"
          value={stores.filter((s) => s.active).length}
          icon={<Store size={22} />}
          accent="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Заказов ожидают"
          value={pending.length}
          icon={<ShoppingCart size={22} />}
          accent="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* Успехи детей по шаблонным магазинам */}
      {activeChildren.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Успехи детей</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeChildren.map((child) => {
              const p = progress[child.id];
              const reading = p?.reading;
              const math = p?.math;
              const mathRate = math && math.total > 0 ? Math.round((math.correct / math.total) * 100) : 0;
              return (
                <div key={child.id} className="card space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{child.avatarEmoji}</div>
                    <div className="font-bold">{child.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-indigo-50 p-3">
                      <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
                        <BookOpen size={14} /> Чтение
                      </div>
                      <div className="mt-1 text-xl font-extrabold">{reading?.booksRead ?? 0}</div>
                      <div className="text-xs text-slate-500">
                        книг · {reading?.pagesRead ?? 0} стр.
                      </div>
                      <div className="text-xs font-semibold text-emerald-600">
                        +{fmtAmount(reading?.pointsEarned ?? 0)} баллов
                      </div>
                    </div>
                    <div className="rounded-xl bg-sky-50 p-3">
                      <div className="flex items-center gap-1 text-xs font-semibold text-sky-600">
                        🧮 Математика
                      </div>
                      <div className="mt-1 text-xl font-extrabold">{math?.correct ?? 0}</div>
                      <div className="text-xs text-slate-500">решено из {math?.total ?? 0}</div>
                      <div className="text-xs font-semibold text-emerald-600">
                        +{fmtAmount(math?.pointsEarned ?? 0)} баллов · {mathRate}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Последние заказы */}
        <section>
          <h2 className="mb-3 text-lg font-bold">Последние заказы</h2>
          {pending.length === 0 ? (
            <EmptyState title="Нет ожидающих заказов" hint="Заказы детей появятся здесь" />
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 5).map((p) => (
                <div key={p.id} className="card flex flex-wrap items-center gap-3">
                  <div className="text-2xl">{p.childAvatar}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">
                      {p.productName}{' '}
                      <span className="text-sm font-normal text-slate-500">· {p.childName}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {p.storeName} · {fmtDate(p.createdAt)}
                    </div>
                    <div className="mt-1 text-sm font-bold text-indigo-700">
                      {fmtAmount(p.amount, p.currencyName)}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                  <div className="flex gap-2">
                    <button
                      className="btn-success !px-3 !py-1.5"
                      disabled={busy}
                      onClick={() => void decide(p.id, 'approve')}
                    >
                      <Check size={16} /> Подтвердить
                    </button>
                    <button
                      className="btn-danger !px-3 !py-1.5"
                      disabled={busy}
                      onClick={() => void decide(p.id, 'reject')}
                    >
                      <X size={16} /> Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Балансы */}
        <section>
          <h2 className="mb-3 text-lg font-bold">Балансы детей</h2>
          {balances.length === 0 ? (
            <EmptyState
              title="Пока нет балансов"
              hint="Создайте ребенка и магазин, чтобы начислять валюту"
            />
          ) : (
            <div className="space-y-3">
              {balances.map((row) => (
                <div key={`${row.childId}-${row.storeId}`} className="card flex items-center gap-3">
                  <div className="text-2xl">{row.childAvatar}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">
                      {row.childName} <span className="text-slate-400">·</span> {row.storeName}
                    </div>
                    <div className="text-sm font-bold text-emerald-700">
                      {row.currencyIcon} {fmtAmount(row.amount, row.currencyName)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="btn-secondary !px-2.5 !py-1.5"
                      disabled={busy}
                      title="Списать 1"
                      onClick={() => void adjust(row, -1)}
                    >
                      <Minus size={15} />
                    </button>
                    <button
                      className="btn-secondary !px-2.5 !py-1.5"
                      disabled={busy}
                      title="Списать 10"
                      onClick={() => void adjust(row, -10)}
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      className="btn-secondary !px-2.5 !py-1.5"
                      disabled={busy}
                      title="Начислить 10"
                      onClick={() => void adjust(row, 10)}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      className="btn-secondary !px-2.5 !py-1.5"
                      disabled={busy}
                      title="Начислить 1"
                      onClick={() => void adjust(row, 1)}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}