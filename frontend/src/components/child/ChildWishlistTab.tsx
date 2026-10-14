import { useCallback, useEffect, useState } from 'react';
import { Gift, Plus, Star, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { WishlistItemDto } from '../../api/types';
import { errMsg, fmtAmount } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer transition hover:scale-110' : 'cursor-default'}
        >
          <Star
            size={18}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}
          />
        </button>
      ))}
    </div>
  );
}

export default function ChildWishlistTab() {
  const [wishlist, setWishlist] = useState<WishlistItemDto[] | null>(null);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [price, setPrice] = useState('');
  const [desire, setDesire] = useState(3);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setWishlist(await api.get<WishlistItemDto[]>('/child/wishlist'));
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addWish = async () => {
    if (!title.trim()) {
      alert('Введите, что вы хотите');
      return;
    }
    const priceNum = price.trim() ? Number(price) : null;
    if (priceNum != null && (!Number.isFinite(priceNum) || priceNum < 0)) {
      alert('Цена должна быть неотрицательным числом');
      return;
    }
    setBusy(true);
    try {
      await api.post('/child/wishlist', {
        title: title.trim(),
        link: link.trim() || null,
        price: priceNum,
        desire,
      });
      setTitle('');
      setLink('');
      setPrice('');
      setDesire(3);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const removeWish = async (id: number) => {
    try {
      await api.del(`/child/wishlist/${id}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  if (wishlist === null) return <Spinner label="Загружаем вишлист…" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gift size={20} className="text-amber-400" />
        <h2 className="rpg-title text-xl">Мой вишлист</h2>
      </div>

      {/* Форма добавления */}
      <div className="rpg-panel space-y-3 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="rpg-input sm:col-span-2"
            placeholder="Что бы ты хотел(а)? Например: новый лего-набор…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="rpg-input"
            placeholder="Ссылка (необязательно)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <input
            className="rpg-input"
            placeholder="Цена (необязательно)"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-400">Степень желания:</span>
            <Stars value={desire} onChange={setDesire} />
          </div>
          <button className="rpg-btn" disabled={busy} onClick={() => void addWish()}>
            <Plus size={16} /> Добавить
          </button>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          title="Список пуст"
          hint="Добавь, что тебе нравится, — родитель увидит список и сможет отметить выполненное"
        />
      ) : (
        <div className="space-y-2">
          {wishlist.map((item) => (
            <div key={item.id} className="rpg-panel flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-sm font-semibold ${
                    item.status === 'DONE' ? 'text-stone-500 line-through' : 'text-amber-100'
                  }`}
                >
                  {item.title}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-300 underline"
                    >
                      ссылка
                    </a>
                  )}
                  {item.price != null && <span>💰 {fmtAmount(item.price)}</span>}
                  <span className="flex items-center gap-1">
                    <Stars value={item.desire} />
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              {item.status === 'DONE' && (
                <span className="rpg-badge border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                  выполнено 🎉
                </span>
              )}
              <button
                className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-500/10 hover:text-rose-300"
                onClick={() => void removeWish(item.id)}
                title="Удалить"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
