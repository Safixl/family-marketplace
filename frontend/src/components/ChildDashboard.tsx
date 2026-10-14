import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Gift,
  Home,
  LogOut,
  Package,
  Settings,
  Swords,
  Trophy,
} from 'lucide-react';
import { api } from '../api/client';
import {
  ChildAchievementGroupDto,
  ChildProfileResponse,
  ChildPurchaseDto,
  ChildSettingsDto,
  SkillId,
  SkillProgressDto,
  StoreDto,
} from '../api/types';
import { useAuth } from '../context/AuthContext';
import { errMsg, fmtAmount } from '../lib/format';
import { levelFromXp } from '../lib/rpg';
import { skillById } from '../lib/skills';
import ChildAchievementsTab from './child/ChildAchievementsTab';
import ChildHomeTab from './child/ChildHomeTab';
import ChildOrdersTab from './child/ChildOrdersTab';
import ChildSettingsTab from './child/ChildSettingsTab';
import ChildWishlistTab from './child/ChildWishlistTab';
import LevelBar from './child/rpg/LevelBar';
import SkillPage from './child/skills/SkillPage';
import SkillsGrid from './child/skills/SkillsGrid';
import { Spinner } from './ui';

type Tab = 'home' | 'skills' | 'achievements' | 'wishlist' | 'orders' | 'settings';

const TABS: Array<{ id: Tab; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'skills', label: 'Навыки', icon: Swords },
  { id: 'achievements', label: 'Достижения', icon: Trophy },
  { id: 'wishlist', label: 'Вишлист', icon: Gift },
  { id: 'orders', label: 'Заказы', icon: Package },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

const DEFAULT_SETTINGS: ChildSettingsDto = {
  theme: 'wow',
  homeWidgets: ['balances', 'stats', 'achievements', 'orders'],
};

export default function ChildDashboard() {
  const { session, logout } = useAuth();
  const child = session?.type === 'child' ? session.profile : null;
  const [tab, setTab] = useState<Tab>('home');
  const [selectedSkill, setSelectedSkill] = useState<SkillId | null>(null);

  const [profile, setProfile] = useState<ChildProfileResponse | null>(null);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [orders, setOrders] = useState<ChildPurchaseDto[]>([]);
  const [achievements, setAchievements] = useState<ChildAchievementGroupDto[]>([]);
  const [skills, setSkills] = useState<SkillProgressDto[]>([]);
  const [settings, setSettings] = useState<ChildSettingsDto>(DEFAULT_SETTINGS);

  const loadProfile = useCallback(async () => {
    try {
      setProfile(await api.get<ChildProfileResponse>('/child/profile'));
    } catch {
      // профиль обновится позже
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await api.get<ChildPurchaseDto[]>('/child/purchases'));
    } catch {
      // заказы обновятся позже
    }
  }, []);

  const loadAchievements = useCallback(async () => {
    try {
      setAchievements(await api.get<ChildAchievementGroupDto[]>('/child/achievements'));
    } catch {
      setAchievements([]);
    }
  }, []);

  const loadSkills = useCallback(async () => {
    try {
      setSkills(await api.get<SkillProgressDto[]>('/child/skills'));
    } catch {
      setSkills([]);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setSettings(await api.get<ChildSettingsDto>('/child/settings'));
    } catch {
      // настройки по умолчанию
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    void loadOrders();
    void loadAchievements();
    void loadSkills();
    void loadSettings();
  }, [loadProfile, loadOrders, loadAchievements, loadSkills, loadSettings]);

  useEffect(() => {
    (async () => {
      try {
        setStores(await api.get<StoreDto[]>('/child/stores'));
      } catch (e) {
        alert(errMsg(e));
      }
    })();
  }, []);

  // Применяем тему
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const afterPurchase = () => {
    void loadOrders();
    void loadProfile();
    void loadSkills();
  };

  const changeTheme = async (theme: string) => {
    const next = { ...settings, theme };
    setSettings(next);
    try {
      setSettings(await api.put<ChildSettingsDto>('/child/settings', { theme, homeWidgets: settings.homeWidgets }));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const changeWidgets = async (widgets: string[]) => {
    const next = { ...settings, homeWidgets: widgets };
    setSettings(next);
    try {
      setSettings(await api.put<ChildSettingsDto>('/child/settings', { theme: settings.theme, homeWidgets: widgets }));
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const navigate = (t: string) => {
    setSelectedSkill(null);
    setTab(t as Tab);
  };

  const openSkill = (skill: SkillId) => {
    setSelectedSkill(skill);
    setTab('skills');
  };

  const totalXp = useMemo(() => skills.reduce((sum, s) => sum + s.xp, 0), [skills]);
  const level = useMemo(() => levelFromXp(totalXp), [totalXp]);

  const storeForSkill = (skill: SkillId): StoreDto | null => {
    const template = skillById(skill).storeTemplate;
    if (!template) return null;
    return stores.find((s) => s.templateType === template) ?? null;
  };

  const balanceForStore = (storeId: number | undefined) =>
    storeId != null ? profile?.balances.find((b) => b.storeId === storeId)?.amount : undefined;

  const skillProgress = (skill: SkillId) => skills.find((s) => s.skill === skill);

  return (
    <div className="theme-body min-h-screen">
      {/* Шапка героя */}
      <header className="theme-header pb-20 pt-6 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-400/50 bg-black/30 text-3xl shadow-lg">
                {child?.avatarEmoji}
              </div>
              <div>
                <div className="text-lg font-extrabold drop-shadow">{child?.name}</div>
                <div className="text-sm text-white/80">Добро пожаловать, герой!</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="rounded-xl bg-white/15 p-2.5 backdrop-blur transition hover:bg-white/25"
              title="Выйти"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Уровень и опыт */}
          <div className="mt-4">
            <LevelBar level={level} />
          </div>

          {/* Балансы */}
          {profile && profile.balances.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.balances.map((b) => (
                <div
                  key={b.storeId}
                  className="rounded-xl border border-amber-400/30 bg-black/25 px-4 py-2 text-sm font-semibold backdrop-blur"
                >
                  {b.currencyIcon} {fmtAmount(b.amount, b.currencyName)}
                  <span className="ml-1 font-normal text-white/70">· {b.storeName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Вкладки */}
      <nav className="sticky top-0 z-20 -mt-12 mb-6 px-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto rounded-2xl border border-amber-900/40 bg-stone-900/95 p-1.5 shadow-xl backdrop-blur">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.id)}
                className={`rpg-tab flex-1 justify-center ${tab === t.id ? 'rpg-tab-active' : ''}`}
              >
                <Icon size={17} /> {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        {tab === 'home' && (
          <ChildHomeTab
            profile={profile}
            achievements={achievements}
            orders={orders}
            skills={skills}
            level={level}
            widgets={settings.homeWidgets}
            onNavigate={navigate}
            onOpenSkill={openSkill}
          />
        )}

        {tab === 'skills' &&
          (selectedSkill ? (
            <SkillPage
              config={skillById(selectedSkill)}
              store={storeForSkill(selectedSkill)}
              balance={balanceForStore(storeForSkill(selectedSkill)?.id)}
              progress={skillProgress(selectedSkill)}
              onBack={() => setSelectedSkill(null)}
              onPurchased={afterPurchase}
            />
          ) : (
            <div className="space-y-4">
              <h2 className="rpg-title text-xl">Навыки героя</h2>
              <p className="text-sm text-stone-400">
                Выбери направление, чтобы открыть его модуль: архив, запросы, магазин, покупки,
                инвентарь и статистику.
              </p>
              <SkillsGrid skills={skills} onSelect={openSkill} />
            </div>
          ))}

        {tab === 'achievements' && <ChildAchievementsTab />}

        {tab === 'wishlist' && <ChildWishlistTab />}

        {tab === 'orders' && <ChildOrdersTab />}

        {tab === 'settings' && (
          <ChildSettingsTab
            profile={profile}
            settings={settings}
            onThemeChange={(t) => void changeTheme(t)}
            onWidgetsChange={(w) => void changeWidgets(w)}
          />
        )}

        {tab === 'home' && !profile && <Spinner label="Загружаем главную…" />}
      </main>
    </div>
  );
}
