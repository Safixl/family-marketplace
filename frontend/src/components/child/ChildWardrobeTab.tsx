import { useCallback, useEffect, useState } from 'react';
import { Shirt, Swords } from 'lucide-react';
import { api } from '../../api/client';
import { ChildAvatarItemDto, DungeonEquipmentDto, DungeonStateDto } from '../../api/types';
import { errMsg } from '../../lib/format';
import { EmptyState, Spinner } from '../ui';

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  SKIN: { label: 'Скины', emoji: '🎭' },
  FRAME: { label: 'Рамки', emoji: '🖼️' },
  PET: { label: 'Питомцы', emoji: '🐾' },
  BACKGROUND: { label: 'Фоны', emoji: '🌌' },
};

/** Классические ячейки экипировки героя. */
const SLOTS: Array<{ slot: string; label: string; emoji: string }> = [
  { slot: 'HEAD', label: 'Голова', emoji: '🪖' },
  { slot: 'BODY', label: 'Тело', emoji: '🎽' },
  { slot: 'LEGS', label: 'Ноги', emoji: '👖' },
  { slot: 'GLOVES', label: 'Перчатки', emoji: '🧤' },
  { slot: 'BOOTS', label: 'Ботинки', emoji: '🥾' },
  { slot: 'HAND_R', label: 'Правая рука', emoji: '⚔️' },
  { slot: 'HAND_L', label: 'Левая рука', emoji: '🛡️' },
];

const RARITY_CLASS: Record<string, string> = {
  COMMON: 'text-stone-300 border-stone-500/40',
  UNCOMMON: 'text-emerald-300 border-emerald-500/40',
  RARE: 'text-sky-300 border-sky-500/40',
  EPIC: 'text-fuchsia-300 border-fuchsia-500/40',
  LEGENDARY: 'text-amber-300 border-amber-500/40',
};

/**
 * «Гардероб Героя»: снаряжение по ячейкам (голова/тело/ноги/перчатки/ботинки/
 * правая и левая рука) + инвентарь вещей из походов + цифровая кастомизация аватара.
 */
export default function ChildWardrobeTab() {
  const [items, setItems] = useState<ChildAvatarItemDto[]>([]);
  const [dungeon, setDungeon] = useState<DungeonStateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api.get<ChildAvatarItemDto[]>('/child/wardrobe'));
    } catch (e) {
      alert(errMsg(e));
    }
    try {
      setDungeon(await api.get<DungeonStateDto>('/child/dungeon'));
    } catch {
      setDungeon(null);
    }
    setLoading(false);
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

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      const d = await api.get<DungeonStateDto>('/child/dungeon');
      setDungeon(d);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Загружаем гардероб…" />;

  const categories = ['SKIN', 'FRAME', 'PET', 'BACKGROUND'] as const;
  const hasAvatarItems = items.length > 0;

  return (
    <div className="space-y-6">
      {/* ----- Снаряжение героя по ячейкам ----- */}
      {dungeon && (
        <section className="rpg-panel p-4 sm:p-5">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-amber-100">
            <Swords size={18} className="text-amber-400" /> Снаряжение героя
          </h3>
          <p className="mb-3 text-xs text-stone-400">
            Вещи выпадают в походах. Нераспознанные определяет мудрец. Без снаряжения атака ×0.1,
            с вещами — сумма статов.
          </p>
          <EquipmentSlots
            equipment={dungeon.equipment}
            busy={busy}
            onIdentify={(id) => act(() => api.post(`/child/dungeon/equipment/${id}/identify`))}
            onEquip={(id) => act(() => api.post(`/child/dungeon/equipment/${id}/equip`))}
          />
        </section>
      )}

      {/* ----- Кастомизация аватара ----- */}
      {!hasAvatarItems ? (
        <EmptyState
          title="Гардероб пуст"
          hint="Выполняй ачивки и квесты — родитель может наградить тебя скинами, рамками, питомцами и фонами"
          icon={<Shirt size={40} />}
        />
      ) : (
        categories.map((cat) => {
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
        })
      )}
    </div>
  );
}

/** Сетка из 7 ячеек + инвентарь вещей. */
function EquipmentSlots({
  equipment,
  busy,
  onIdentify,
  onEquip,
}: {
  equipment: DungeonEquipmentDto[];
  busy: boolean;
  onIdentify: (id: number) => void;
  onEquip: (id: number) => void;
}) {
  const equippedBySlot = new Map(equipment.filter((e) => e.equipped).map((e) => [e.slot, e]));
  const inventory = equipment.filter((e) => !e.equipped);

  return (
    <div className="space-y-4">
      {/* Ячейки */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {SLOTS.map(({ slot, label, emoji }) => {
          const item = equippedBySlot.get(slot);
          return (
            <div
              key={slot}
              className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition ${
                item
                  ? RARITY_CLASS[item.rarity] ?? 'border-stone-500/40 text-stone-300'
                  : 'border-dashed border-stone-600/60 text-stone-500'
              }`}
              title={item ? item.description : `${label} — пусто`}
            >
              <span className="text-2xl">{item ? item.icon : emoji}</span>
              <span className="text-[10px] uppercase tracking-wide opacity-70">{label}</span>
              {item ? (
                <>
                  <span className="line-clamp-2 text-[11px] font-semibold leading-tight">{item.name}</span>
                  <button
                    className="rpg-btn rpg-btn-ghost !px-2 !py-0.5 text-[10px]"
                    disabled={busy}
                    onClick={() => onEquip(item.id)}
                  >
                    Снять
                  </button>
                </>
              ) : (
                <span className="text-[11px]">пусто</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Инвентарь */}
      <div>
        <div className="mb-2 text-sm font-bold text-amber-200">🎒 Инвентарь</div>
        {inventory.length === 0 ? (
          <p className="rounded-xl border border-stone-600/40 bg-stone-900/60 px-4 py-3 text-sm text-stone-400">
            Рюкзак пуст. Снаряжение выпадает из сундуков и боссов в подземельях!
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-xl border bg-stone-900/60 p-3 ${
                  item.identified ? RARITY_CLASS[item.rarity] ?? 'border-stone-600/40 text-stone-300' : 'border-stone-600/40'
                }`}
              >
                <span className="text-2xl">{item.identified ? item.icon : '❔'}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {item.identified ? item.name : 'Нераспознанная вещь'}
                  </div>
                  <div className="text-xs opacity-80">
                    {item.identified
                      ? `${SLOTS.find((s) => s.slot === item.slot)?.label ?? item.slot} · ×${item.statMultiplier.toFixed(1)} к атаке`
                      : 'Мудрец определит, что это'}
                  </div>
                </div>
                {item.identified ? (
                  <button
                    className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => onEquip(item.id)}
                  >
                    Надеть
                  </button>
                ) : (
                  <button
                    className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => onIdentify(item.id)}
                  >
                    Определить
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
