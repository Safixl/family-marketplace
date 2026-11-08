import { useCallback, useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import {
  BookOpen,
  Calculator,
  Dumbbell,
  Globe2,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Puzzle,
  ScrollText,
  ShoppingCart,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ChildDto, SkillActivationDto } from '../api/types';
import AchievementsTab from './tabs/AchievementsTab';
import { NotificationBell, NotificationPanel } from './NotificationCenter';
import ChildrenTab from './tabs/ChildrenTab';
import OverviewTab from './tabs/OverviewTab';
import PurchasesTab from './tabs/PurchasesTab';
import QuestsTab from './tabs/QuestsTab';
import SeasonalTab from './tabs/SeasonalTab';
import StoresTab from './tabs/StoresTab';

type TabId =
  | 'overview'
  | 'children'
  | 'reading'
  | 'math'
  | 'logic'
  | 'lang'
  | 'sport'
  | 'house'
  | 'other'
  | 'achievements'
  | 'purchases'
  | 'quests'
  | 'seasonal';

const TABS: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Профиль ребенка', icon: LayoutDashboard },
  { id: 'children', label: 'Дети', icon: Users },
  { id: 'reading', label: 'Чтение', icon: BookOpen },
  { id: 'math', label: 'Математика', icon: Calculator },
  { id: 'logic', label: 'Логика', icon: Puzzle },
  { id: 'lang', label: 'Иностранный язык', icon: Globe2 },
  { id: 'sport', label: 'Спорт и хобби', icon: Dumbbell },
  { id: 'house', label: 'Хозяйственность', icon: Home },
  { id: 'other', label: 'Прочее', icon: Package },
  { id: 'quests', label: 'Квесты', icon: ScrollText },
  { id: 'seasonal', label: 'Сезоны', icon: Sparkles },
  { id: 'achievements', label: 'Достижения', icon: Trophy },
  { id: 'purchases', label: 'Покупки', icon: ShoppingCart },
];

/** Вкладка навыка → код навыка (вкладка видна только когда навык активирован ребёнку). */
const TAB_SKILL: Partial<Record<TabId, string>> = {
  reading: 'READING',
  math: 'MATH',
  logic: 'LOGIC',
  lang: 'LANG',
  sport: 'SPORT',
  house: 'HOUSE',
};

/**
 * Клик по уведомлению открывает вкладку, где родитель может ответить:
 * квесты → «Квесты», спорт-дейлик → «Спорт и хобби», чтение → «Чтение» и т.д.
 */
function tabForNotification(n: { type: string; payload: string | null }): TabId {
  switch (n.type) {
    case 'QUEST':
      return 'quests';
    case 'CARD_REVEAL':
    case 'CARD_HELP': {
      const p = (n.payload ?? '').toUpperCase();
      if (p.includes('HOUSE')) return 'house';
      if (p.includes('LOGIC')) return 'logic';
      return 'math';
    }
    case 'HOUSE_CHECK':
      return 'house';
    case 'SPORT_REVIEW':
      return 'sport';
    case 'READING_DONE':
    case 'BOOK_REQUEST':
      return 'reading';
    case 'POCKET':
      return 'children';
    default:
      return 'overview';
  }
}

export default function ParentDashboard() {
  const { session, logout } = useAuth();
  const [tab, setTab] = useState<TabId>('overview');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  /** Список детей и выбранный ребёнок — все вкладки показывают его профиль. */
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  /** Активированные навыки детей — вкладки навыков видны только для активированных. */
  const [activations, setActivations] = useState<SkillActivationDto[]>([]);
  const profile = session?.type === 'parent' ? session.profile : null;

  const loadChildren = useCallback(async () => {
    try {
      const list = await api.get<ChildDto[]>('/parent/children');
      setChildren(list);
      setSelectedChildId((prev) => {
        if (prev != null && list.some((c) => c.id === prev)) return prev;
        return list.length > 0 ? list[0].id : null;
      });
    } catch {
      // тихо — селектор просто не появится
    }
  }, []);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  const loadActivations = useCallback(async () => {
    try {
      setActivations(await api.get<SkillActivationDto[]>('/parent/skill-activations'));
    } catch {
      // тихо — вкладки навыков просто не появятся до перезагрузки
    }
  }, []);

  useEffect(() => {
    void loadActivations();
  }, [loadActivations]);

  /** Коды навыков, активированных выбранному ребёнку. */
  const activeSkillCodes =
    selectedChildId == null ? [] : activations.filter((a) => a.childId === selectedChildId).map((a) => a.skill);

  const refreshNotifCount = useCallback(async () => {
    try {
      const count = await api.get<number>('/parent/notifications/count');
      setNotifCount(count);
    } catch {
      // тихо — бейдж просто не обновится
    }
  }, []);

  useEffect(() => {
    void refreshNotifCount();
    const timer = setInterval(() => void refreshNotifCount(), 15000);
    return () => clearInterval(timer);
  }, [refreshNotifCount]);

  /** Обновить список детей после действий во вкладке «Дети» (создание/удаление). */
  const handleChildrenChanged = useCallback(() => {
    void loadChildren();
  }, [loadChildren]);

  /** Запрос на создание квеста из «Профиля ребенка» (seq — чтобы повторный клик снова открывал форму). */
  const [questCreate, setQuestCreate] = useState<{ childId: number | null; seq: number } | null>(null);
  const startQuestCreate = useCallback((childId: number | null) => {
    setTab('quests');
    setQuestCreate((prev) => ({ childId, seq: (prev?.seq ?? 0) + 1 }));
  }, []);

  /** Вкладки, доступные для выбранного ребёнка (навыковые — только при активации). */
  const visibleTabs = TABS.filter((t) => {
    const skill = TAB_SKILL[t.id];
    return !skill || activeSkillCodes.includes(skill);
  });

  // Выбранный ребёнок без активированного навыка → уходим с навыковой вкладки
  useEffect(() => {
    const skill = TAB_SKILL[tab];
    if (skill && !activeSkillCodes.includes(skill)) {
      setTab('overview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedChildId, activations]);

  /** Обновление активаций после включения/выключения навыка в «Профиле ребенка». */
  const handleSkillsChanged = useCallback(() => {
    void loadActivations();
    void loadChildren();
  }, [loadActivations, loadChildren]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Сайдбар (десктоп) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 p-4 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <Zap size={20} />
          </div>
          <div>
            <div className="font-bold text-white">Дейлики</div>
            <div className="text-xs text-slate-400">Кабинет Гейм-Мастера</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
        {visibleTabs.map((t) => {
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
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="truncate text-sm font-semibold text-white">{profile?.name}</span>
            <NotificationBell count={notifCount} onClick={() => setNotifOpen(true)} />
          </div>
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
          <Zap size={20} className="text-indigo-400" />
          <span className="font-bold">Дейлики</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell count={notifCount} onClick={() => setNotifOpen(true)} />
          <button onClick={logout} className="rounded-xl p-2 text-slate-300 hover:bg-slate-800" title="Выйти">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Контент */}
      <main className="px-4 pb-24 pt-6 sm:px-6 lg:ml-64 lg:pb-10">
        <div className="mx-auto max-w-6xl">
          {/* Селектор выбранного ребёнка — сверху справа, виден на всех вкладках */}
          {children.length > 0 && (
            <div className="sticky top-0 z-20 -mx-1 mb-4 flex items-center justify-end bg-slate-100/95 px-1 py-2 backdrop-blur lg:top-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                <UserRound size={16} className="text-indigo-500" />
                <span className="hidden text-xs font-semibold text-slate-500 sm:inline">Профиль:</span>
                <select
                  className="max-w-[180px] cursor-pointer bg-transparent text-sm font-bold text-slate-700 outline-none"
                  value={selectedChildId ?? ''}
                  onChange={(e) => setSelectedChildId(Number(e.target.value))}
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.avatarEmoji} {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {tab === 'overview' && (
            <OverviewTab selectedChildId={selectedChildId} onCreateQuest={startQuestCreate} onSkillsChanged={handleSkillsChanged} />
          )}
          {tab === 'children' && <ChildrenTab onChanged={handleChildrenChanged} />}
          {tab === 'reading' && <StoresTab templateFilter="READING" title="📚 Чтение" selectedChildId={selectedChildId} />}
          {tab === 'math' && <StoresTab templateFilter="MATH" title="🧮 Математика" selectedChildId={selectedChildId} />}
          {tab === 'logic' && <StoresTab templateFilter="LOGIC" title="🧩 Логика" selectedChildId={selectedChildId} />}
          {tab === 'lang' && <StoresTab templateFilter="LANG" title="🌍 Иностранный язык" selectedChildId={selectedChildId} />}
          {tab === 'sport' && <StoresTab templateFilter="SPORT" title="⚽ Спорт и хобби" selectedChildId={selectedChildId} />}
          {tab === 'house' && <StoresTab templateFilter="HOME" title="🏠 Хозяйственность" selectedChildId={selectedChildId} />}
          {tab === 'other' && <StoresTab templateFilter="NONE" title="📦 Прочее" selectedChildId={selectedChildId} />}
          {tab === 'achievements' && <AchievementsTab selectedChildId={selectedChildId} />}
          {tab === 'purchases' && <PurchasesTab selectedChildId={selectedChildId} />}
          {tab === 'quests' && (
            <QuestsTab
              selectedChildId={selectedChildId}
              createRequest={questCreate}
              onCreateConsumed={() => setQuestCreate(null)}
            />
          )}
          {tab === 'seasonal' && <SeasonalTab />}
        </div>
      </main>

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onChanged={refreshNotifCount}
        onNavigate={(n) => setTab(tabForNotification(n))}
      />

      {/* Нижняя навигация (мобильный) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        {visibleTabs.map((t) => {
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