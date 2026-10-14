import { useState } from 'react';
import { LayoutDashboard, LogOut, ShoppingCart, Store, Trophy, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AchievementsTab from './tabs/AchievementsTab';
import ChildrenTab from './tabs/ChildrenTab';
import OverviewTab from './tabs/OverviewTab';
import PurchasesTab from './tabs/PurchasesTab';
import StoresTab from './tabs/StoresTab';

type TabId = 'overview' | 'children' | 'stores' | 'achievements' | 'purchases';

const TABS: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'children', label: 'Дети', icon: Users },
  { id: 'stores', label: 'Магазины', icon: Store },
  { id: 'achievements', label: 'Достижения', icon: Trophy },
  { id: 'purchases', label: 'Покупки', icon: ShoppingCart },
];

export default function ParentDashboard() {
  const { session, logout } = useAuth();
  const [tab, setTab] = useState<TabId>('overview');
  const profile = session?.type === 'parent' ? session.profile : null;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Сайдбар (десктоп) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 p-4 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <Store size={20} />
          </div>
          <div>
            <div className="font-bold text-white">Семейный магазин</div>
            <div className="text-xs text-slate-400">Кабинет родителя</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} /> {t.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 pt-4">
          <div className="mb-2 truncate px-2 text-sm font-semibold text-white">{profile?.name}</div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </aside>

      {/* Шапка (мобильный) */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 text-white">
          <Store size={20} className="text-indigo-400" />
          <span className="font-bold">Семейный магазин</span>
        </div>
        <button onClick={logout} className="rounded-xl p-2 text-slate-300 hover:bg-slate-800" title="Выйти">
          <LogOut size={20} />
        </button>
      </header>

      {/* Контент */}
      <main className="px-4 pb-24 pt-6 sm:px-6 lg:ml-64 lg:pb-10">
        <div className="mx-auto max-w-6xl">
          {tab === 'overview' && <OverviewTab />}
          {tab === 'children' && <ChildrenTab />}
          {tab === 'stores' && <StoresTab />}
          {tab === 'achievements' && <AchievementsTab />}
          {tab === 'purchases' && <PurchasesTab />}
        </div>
      </main>

      {/* Нижняя навигация (мобильный) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium ${
                tab === t.id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={20} /> {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}