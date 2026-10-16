import { useCallback, useEffect, useState } from 'react';
import { PiggyBank } from 'lucide-react';
import { api } from '../../api/client';
import { ChildProfileResponse, DepositDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

/**
 * «Личный инвест-фонд»: баллы магазина кладутся на депозит под процент
 * (5-10% в неделю, капитализация). Обучает финансовой грамотности.
 */
export default function ChildDepositsTab() {
  const [deposits, setDeposits] = useState<DepositDto[]>([]);
  const [profile, setProfile] = useState<ChildProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [storeId, setStoreId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('5');
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');

  const load = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([
        api.get<DepositDto[]>('/child/deposits'),
        api.get<ChildProfileResponse>('/child/profile'),
      ]);
      setDeposits(d);
      setProfile(p);
      if (storeId === '' && p.balances.length > 0) setStoreId(String(p.balances[0].storeId));
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    const numericAmount = Number(amount);
    if (!storeId || !numericAmount || numericAmount <= 0) return;
    setBusy(true);
    try {
      await api.post(`/child/deposits/${mode}`, {
        storeId: Number(storeId),
        amount: numericAmount,
        rate: Number(rate) || 5,
      });
      setAmount('');
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Загружаем депозиты…" />;

  if ((profile?.balances.length ?? 0) === 0 && deposits.length === 0) {
    return (
      <EmptyState
        title="Инвест-фонд недоступен"
        hint="Заработай баллы в любом навыке — их можно будет положить на депозит под процент"
        icon={<PiggyBank size={40} />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rpg-panel rpg-panel-gold p-4 sm:p-6">
        <h2 className="rpg-title flex items-center gap-2 text-xl">
          <PiggyBank size={22} className="text-amber-400" /> Личный инвест-фонд
        </h2>
        <p className="mt-1 text-sm text-stone-400">
          Клади баллы под процент — каждую неделю сумма растёт на выбранную ставку. Так работает
          настоящий банк!
        </p>
      </section>

      {/* Управление */}
      <section className="rpg-panel p-4 sm:p-5">
        <div className="mb-3 flex gap-1 rounded-xl bg-stone-900 p-1">
          {(['deposit', 'withdraw'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === m ? 'bg-amber-500/20 text-amber-200' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {m === 'deposit' ? '📈 Вложить' : '💸 Снять'}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-stone-400">
            Магазин
            <select className="rpg-input" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              {profile?.balances.map((b) => (
                <option key={b.storeId} value={String(b.storeId)}>
                  {b.currencyIcon} {b.storeName} — {fmtAmount(b.amount, b.currencyName)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-400">
            {mode === 'deposit' ? 'Сумма вклада' : 'Сумма снятия'}
            <input
              type="number"
              min={0}
              className="rpg-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          {mode === 'deposit' ? (
            <label className="flex flex-col gap-1 text-xs text-stone-400">
              Ставка в неделю, %
              <input
                type="number"
                min={1}
                max={10}
                className="rpg-input"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </label>
          ) : (
            <div className="flex items-end">
              <button className="rpg-btn w-full" disabled={busy} onClick={() => void submit()}>
                Снять
              </button>
            </div>
          )}
        </div>
        {mode === 'deposit' && (
          <button className="rpg-btn mt-3" disabled={busy} onClick={() => void submit()}>
            Вложить под процент
          </button>
        )}
      </section>

      {/* Депозиты */}
      {deposits.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-200">Мои вклады</h3>
          <div className="space-y-3">
            {deposits.map((d) => (
              <div key={d.id} className="rpg-panel flex flex-wrap items-center gap-3 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                  {d.currencyIcon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-amber-100">{d.storeName}</div>
                  <div className="text-sm text-stone-400">
                    Ставка {d.rate}% в неделю · {d.currencyName}
                  </div>
                </div>
                <div className="text-lg font-extrabold text-emerald-300">
                  {fmtAmount(d.amount, d.currencyName)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
