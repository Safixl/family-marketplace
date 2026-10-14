import { Check, Coins, Package, Palette, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { ChildProfileResponse, ChildSettingsDto } from '../../api/types';
import { fmtAmount } from '../../lib/format';
import { THEMES } from '../../lib/themes';
import { HOME_WIDGETS, HomeWidgetId } from './ChildHomeTab';
import { StatCard } from '../ui';

interface Props {
  profile: ChildProfileResponse | null;
  settings: ChildSettingsDto;
  onThemeChange: (theme: string) => void;
  onWidgetsChange: (widgets: string[]) => void;
}

export default function ChildSettingsTab({ profile, settings, onThemeChange, onWidgetsChange }: Props) {
  const unlockedCount = profile?.achievements.length ?? 0;

  const toggleWidget = (id: HomeWidgetId) => {
    const current = settings.homeWidgets;
    const next = current.includes(id)
      ? current.filter((w) => w !== id)
      : [...current, id];
    onWidgetsChange(next);
  };

  return (
    <div className="space-y-6">
      {/* Тема оформления */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Palette size={20} className="theme-accent-text" /> Оформление
        </h2>
        <p className="theme-muted mb-3 text-sm">
          Выбери тему под своё настроение. Маленьким — ярко, постарше — спокойнее.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEMES.map((theme) => {
            const active = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                className={`theme-card relative overflow-hidden rounded-2xl border-2 p-4 text-left transition ${
                  active ? 'theme-ring border-transparent' : 'hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <div className="mb-3 h-10 rounded-xl" style={{ background: theme.preview }} />
                <div className="font-bold">
                  {theme.emoji} {theme.name}
                </div>
                <div className="theme-muted text-xs">{theme.hint}</div>
                <div className="theme-muted mt-0.5 text-[11px]">{theme.age}</div>
                {active && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Виджеты главной */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <SlidersHorizontal size={20} className="theme-accent-text" /> Главная страница
        </h2>
        <p className="theme-muted mb-3 text-sm">
          Выбери, что показывать на главной. Остальное всегда доступно в своих разделах.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {HOME_WIDGETS.map((widget) => {
            const active = settings.homeWidgets.includes(widget.id);
            return (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`theme-card flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                  active ? 'theme-ring border-transparent' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span className="text-xl">{widget.emoji}</span>
                <span className="flex-1 font-semibold">{widget.label}</span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-transparent'
                  }`}
                >
                  <Check size={14} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Статистика */}
      {profile && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Coins size={20} className="theme-accent-text" /> Моя статистика
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Оплаченных покупок"
              value={profile.stats.paidCount}
              icon={<ShoppingBag size={22} />}
              accent="bg-gradient-to-br from-indigo-500 to-violet-600"
            />
            <StatCard
              label="Потрачено всего"
              value={fmtAmount(profile.stats.paidTotal)}
              icon={<Coins size={22} />}
              accent="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <StatCard
              label="Достижений получено"
              value={unlockedCount}
              icon={<Package size={22} />}
              accent="bg-gradient-to-br from-amber-500 to-orange-600"
            />
          </div>
        </section>
      )}

      {/* Купленные товары */}
      {profile && profile.purchasedItems.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Package size={20} className="theme-accent-text" /> Мои покупки
          </h2>
          <div className="space-y-2">
            {profile.purchasedItems.map((item) => (
              <div key={`${item.productId}-${item.confirmedAt}`} className="theme-card flex items-center gap-3 rounded-xl border px-4 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-btn-soft">
                  <Package size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{item.productName}</div>
                  <div className="theme-muted text-xs">
                    {item.storeName}
                    {item.confirmedAt && ` · ${new Date(item.confirmedAt).toLocaleDateString('ru-RU')}`}
                  </div>
                </div>
                <div className="theme-accent-text shrink-0 text-sm font-bold">
                  {item.currencyIcon} {fmtAmount(item.price, item.currencyName)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
