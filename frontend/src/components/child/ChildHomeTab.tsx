import { Coins, Package, ShoppingBag, Sparkles, Swords, Trophy } from 'lucide-react';
import {
  ChildAchievementGroupDto,
  ChildProfileResponse,
  ChildPurchaseDto,
  SkillId,
  SkillProgressDto,
} from '../../api/types';
import { fmtAmount, fmtDate } from '../../lib/format';
import { tierForLevel } from '../../lib/achievementTiers';
import { RpgLevel } from '../../lib/rpg';
import { EmptyState, StatCard } from '../ui';
import SkillHexagon from './rpg/SkillHexagon';

export type HomeWidgetId = 'balances' | 'stats' | 'achievements' | 'orders';

export const HOME_WIDGETS: Array<{ id: HomeWidgetId; label: string; emoji: string }> = [
  { id: 'balances', label: 'Мои баллы', emoji: '💰' },
  { id: 'stats', label: 'Статистика', emoji: '📊' },
  { id: 'achievements', label: 'Достижения', emoji: '🏆' },
  { id: 'orders', label: 'Последние заказы', emoji: '📦' },
];

interface Props {
  profile: ChildProfileResponse | null;
  achievements: ChildAchievementGroupDto[];
  orders: ChildPurchaseDto[];
  skills: SkillProgressDto[];
  level: RpgLevel;
  widgets: string[];
  onNavigate: (tab: string) => void;
  onOpenSkill: (skill: SkillId) => void;
}

export default function ChildHomeTab({
  profile,
  achievements,
  orders,
  skills,
  level,
  widgets,
  onNavigate,
  onOpenSkill,
}: Props) {
  const show = (id: HomeWidgetId) => widgets.includes(id);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const nextAchievements = achievements
    .filter((a) => !a.unlocked && a.targetType && a.targetType !== 'NONE')
    .sort((a, b) => {
      const pa = a.targetValue > 0 ? a.progress / a.targetValue : 1;
      const pb = b.targetValue > 0 ? b.progress / b.targetValue : 1;
      return pb - pa;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Гексагон навыков */}
      <section className="rpg-panel rpg-panel-gold p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-amber-200">
            <Swords size={20} className="text-amber-400" /> Карта навыков
          </h2>
          <div className="flex items-center gap-2">
            <span className="rpg-badge border border-amber-500/30 bg-amber-500/15 text-amber-300">
              {level.rankEmoji} {level.rank} · ур. {level.level}
            </span>
            <button
              onClick={() => onNavigate('skills')}
              className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
            >
              Все навыки
            </button>
          </div>
        </div>
        <p className="mb-3 text-sm text-stone-400">
          Нажми на вершину шестиугольника, чтобы открыть модуль навыка. Навыки растут от центра к
          краям по мере выполнения заданий и получения ачивок.
        </p>
        <SkillHexagon skills={skills} onSelect={onOpenSkill} />
      </section>

      {show('balances') && profile && profile.balances.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-200">
            <Coins size={20} className="text-amber-400" /> Мои баллы
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profile.balances.map((b) => (
              <div key={b.storeId} className="rpg-panel flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-xl">
                  {b.currencyIcon}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-stone-300">{b.storeName}</div>
                  <div className="text-lg font-extrabold text-amber-300">
                    {fmtAmount(b.amount, b.currencyName)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {show('stats') && profile && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-200">
            <Sparkles size={20} className="text-amber-400" /> Моя статистика
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Оплаченных покупок"
              value={profile.stats.paidCount}
              icon={<ShoppingBag size={22} />}
              accent="bg-gradient-to-br from-amber-500 to-orange-600"
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
              icon={<Trophy size={22} />}
              accent="bg-gradient-to-br from-sky-500 to-indigo-600"
            />
          </div>
        </section>
      )}

      {show('achievements') && nextAchievements.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-200">
              <Trophy size={20} className="text-amber-400" /> Ближайшие достижения
            </h2>
            <button
              onClick={() => onNavigate('achievements')}
              className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
            >
              Все достижения
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nextAchievements.map((a) => {
              const tier = tierForLevel(a.level);
              const percent = a.targetValue > 0 ? Math.min(100, Math.round((a.progress / a.targetValue) * 100)) : 0;
              return (
                <div key={a.achievementId} className="rpg-panel flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg text-white ${tier.iconBox}`}>
                      {a.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-amber-100">{a.name}</div>
                      <div className="text-xs text-stone-400">
                        {Math.min(a.progress, a.targetValue)} из {a.targetValue}
                      </div>
                    </div>
                  </div>
                  <div className="rpg-progress-track h-2">
                    <div className="rpg-progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {show('orders') && orders.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-200">
              <Package size={20} className="text-amber-400" /> Последние заказы
            </h2>
            <button
              onClick={() => onNavigate('orders')}
              className="rpg-btn rpg-btn-ghost !px-3 !py-1.5 text-xs"
            >
              Все заказы
            </button>
          </div>
          <div className="space-y-2">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="rpg-panel flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-amber-100">{order.productName}</div>
                  <div className="text-xs text-stone-400">
                    {order.storeName} · {fmtDate(order.createdAt)}
                  </div>
                </div>
                <div className="text-sm font-bold text-amber-300">
                  {order.currencyIcon} {fmtAmount(order.amount, order.currencyName)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!show('balances') && !show('stats') && !show('achievements') && !show('orders') && (
        <EmptyState
          title="Главная пуста"
          hint="Открой настройки и выбери, что показывать на главной"
        />
      )}
    </div>
  );
}
