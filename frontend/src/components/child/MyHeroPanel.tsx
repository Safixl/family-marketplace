import { useState } from 'react';
import { Gift, Package, PiggyBank, Shirt, X } from 'lucide-react';
import ChildDepositsTab from './ChildDepositsTab';
import ChildOrdersTab from './ChildOrdersTab';
import ChildWardrobeTab from './ChildWardrobeTab';
import ChildWishlistTab from './ChildWishlistTab';

type HeroTab = 'deposit' | 'wardrobe' | 'wishlist' | 'orders';

const HERO_TABS: Array<{ id: HeroTab; label: string; icon: typeof PiggyBank }> = [
  { id: 'deposit', label: 'Банк', icon: PiggyBank },
  { id: 'wardrobe', label: 'Гардероб', icon: Shirt },
  { id: 'wishlist', label: 'Вишлист', icon: Gift },
  { id: 'orders', label: 'Заказы', icon: Package },
];

interface Props {
  childName: string;
  avatarEmoji: string;
  onClose: () => void;
}

/**
 * «Мой Герой» — панель профиля, открывается по клику на портрет.
 * Содержит Банк, Гардероб, Вишлист и Заказы (перенесены с главного экрана).
 */
export default function MyHeroPanel({ childName, avatarEmoji, onClose }: Props) {
  const [tab, setTab] = useState<HeroTab>('deposit');

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="rpg-panel rpg-panel-gold w-full max-w-3xl p-4 sm:p-6">
        {/* Шапка героя */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-400/50 bg-black/30 text-3xl shadow-lg">
              {avatarEmoji}
            </div>
            <div>
              <div className="text-lg font-extrabold text-amber-100">{childName}</div>
              <div className="text-sm text-amber-200/70">Мой Герой</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2.5 text-white/80 transition hover:bg-white/20"
            title="Закрыть"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {/* Вкладки героя */}
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
          {HERO_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rpg-tab ${tab === t.id ? 'rpg-tab-active' : ''}`}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {tab === 'deposit' && <ChildDepositsTab />}
          {tab === 'wardrobe' && <ChildWardrobeTab />}
          {tab === 'wishlist' && <ChildWishlistTab />}
          {tab === 'orders' && <ChildOrdersTab />}
        </div>
      </div>
    </div>
  );
}