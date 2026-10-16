import { useCallback, useEffect, useState } from 'react';
import { Shirt } from 'lucide-react';
import { api } from '../../api/client';
import { ChildAvatarItemDto } from '../../api/types';
import { errMsg } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  SKIN: { label: 'Скины', emoji: '🎭' },
  FRAME: { label: 'Рамки', emoji: '🖼️' },
  PET: { label: 'Питомцы', emoji: '🐾' },
  BACKGROUND: { label: 'Фоны', emoji: '🌌' },
};

/**
 * «Гардероб Героя» — Инвентарь А: цифровая кастомизация аватара.
 * Предметы выдаются за ачивки, квесты или покупаются в магазине «Гардероб».
 * В каждой категории надет максимум один предмет.
 */
export default function ChildWardrobeTab() {
  const [items, setItems] = useState<ChildAvatarItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api.get<ChildAvatarItemDto[]>('/child/wardrobe'));
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (id: number, equipped: boolean) => {
    setBusy(true);
    try {
      await api.put(`/child/wardrobe/${id}/equip?equipped=${equipped}`);
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Загружаем гардероб…" />;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Гардероб пуст"
        hint="Выполняй ачивки и квесты — родитель может наградить тебя скинами, рамками, питомцами и фонами"
        icon={<Shirt size={40} />}
      />
    );
  }

  const categories = ['SKIN', 'FRAME', 'PET', 'BACKGROUND'] as const;

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat];
        const group = items.filter((i) => i.category === cat);
        if (group.length === 0) return null;
        return (
          <section key={cat} className="rpg-panel p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-100">
              {meta.emoji} {meta.label}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((item) => (
                <button
                  key={item.id}
                  disabled={busy}
                  onClick={() => void toggle(item.id, !item.equipped)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    item.equipped
                      ? 'border-amber-500/60 bg-amber-500/15'
                      : 'border-stone-700 bg-stone-900/60 hover:border-amber-500/40'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-800 text-xl">
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-amber-100">{item.name}</span>
                    <span className={`text-xs ${item.equipped ? 'text-amber-300' : 'text-stone-400'}`}>
                      {item.equipped ? '✓ Надето — снять' : 'Надеть'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
