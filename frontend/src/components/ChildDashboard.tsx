import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Home,
  LogOut,
  Package,
  ScrollText,
  Settings,
  Store,
  Swords,
  Trophy,
} from 'lucide-react';
import { api } from '../api/client';
import {
  ChildAchievementGroupDto,
  ChildProductDto,
  ChildProfileResponse,
  ChildPurchaseDto,
  ChildSettingsDto,
  InventoryStackDto,
  LevelDto,
  SkillId,
  SkillProgressDto,
  StoreDto,
} from '../api/types';
import { useAuth } from '../context/AuthContext';
import { errMsg, fmtAmount } from '../lib/format';
import { levelFromXp, RpgLevel } from '../lib/rpg';
import { skillById } from '../lib/skills';
import AchievementPopup from './child/AchievementPopup';
import ChildAchievementsTab from './child/ChildAchievementsTab';
import ChildHomeTab from './child/ChildHomeTab';
import ChildInventoryTab from './child/ChildInventoryTab';
import ChildQuestsDailiesTab from './child/ChildQuestsDailiesTab';
import ChildSettingsTab from './child/ChildSettingsTab';
import ChildShopsTab from './child/ChildShopsTab';
import MyHeroPanel from './child/MyHeroPanel';
import LevelBar from './child/rpg/LevelBar';
import SkillPage from './child/skills/SkillPage';
import SkillsGrid from './child/skills/SkillsGrid';
import { Spinner } from './ui';

type Tab = 'home' | 'quests' | 'shops' | 'inventory' | 'skills' | 'achievements';

const TABS: Array<{ id: Tab; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'quests', label: 'Квесты и Дейлики', icon: ScrollText },
  { id: 'shops', label: 'Магазины', icon: Store },
  { id: 'inventory', label: 'Инвентарь', icon: Package },
  { id: 'skills', label: 'Навыки', icon: Swords },
  { id: 'achievements', label: 'Достижения', icon: Trophy },
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
  const [heroOpen, setHeroOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [profile, setProfile] = useState<ChildProfileResponse | null>(null);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [products, setProducts] = useState<ChildProductDto[]>([]);
  const [orders, setOrders] = useState<ChildPurchaseDto[]>([]);
  const [inventory, setInventory] = useState<InventoryStackDto[]>([]);
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

  const loadInventory = useCallback(async () => {
    try {
      setInventory(await api.get<InventoryStackDto[]>('/child/inventory'));
    } catch {
      setInventory([]);
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

  const loadProducts = useCallback(async (storeList: StoreDto[]) => {
    try {
      const lists = await Promise.all(
        storeList.map((s) => api.get<ChildProductDto[]>(`/child/stores/${s.id}/products`)),
      );
      setProducts(lists.flat());
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    void loadOrders();
    void loadInventory();
    void loadAchievements();
    void loadSkills();
    void loadSettings();
  }, [loadProfile, loadOrders, loadInventory, loadAchievements, loadSkills, loadSettings]);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.get<StoreDto[]>('/child/stores');
        setStores(list);
        void loadProducts(list);
      } catch (e) {
        alert(errMsg(e));
      }
    })();
  }, [loadProducts]);

  // Применяем тему
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const afterPurchase = () => {
    void loadOrders();
    void loadProfile();
    void loadSkills();
    void loadInventory();
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
  const [serverLevel, setServerLevel] = useState<LevelDto | null>(null);
  const localLevel = useMemo(() => levelFromXp(totalXp), [totalXp]);

  // Общий уровень с бэкенда: 50% опыта навыков + опыт ачивок и квестов
  useEffect(() => {
    (async () => {
      try {
        setServerLevel(await api.get<LevelDto>('/child/level'));
      } catch {
        // используем локальный расчёт
      }
    })();
  }, [skills.length]);

  const level: RpgLevel = serverLevel
    ? {
        level: serverLevel.level,
        xpInLevel: serverLevel.xpInLevel,
        xpToNext: serverLevel.xpToNext,
        ratio: serverLevel.ratio,
        rank: serverLevel.rank,
        rankEmoji: serverLevel.rankEmoji,
      }
    : localLevel;

  const storeForSkill = (skill: SkillId): StoreDto | null => {
    const template = skillById(skill).storeTemplate;
    if (!template) return null;
    return stores.find((s) => s.templateType === template) ?? null;
  };

  const skillProgress = (skill: SkillId) => skills.find((s) => s.skill === skill);

  return (
    <div className="theme-body min-h-screen">
      <AchievementPopup achievements={achievements} />

      {heroOpen && child && (
        <MyHeroPanel childName={child.name} avatarEmoji={child.avatarEmoji} onClose={() => setHeroOpen(false)} />
      )}

      {settingsOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="rpg-panel rpg-panel-gold w-full max-w-2xl p-4 sm:p-6">
            <ChildSettingsTab
              profile={profile}
              settings={settings}
              onThemeChange={(t) => void changeTheme(t)}
              onWidgetsChange={(w) => void changeWidgets(w)}
            />
            <div className="mt-4 flex justify-end">
              <button className="rpg-btn rpg-btn-ghost" onClick={() => setSettingsOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Шапка героя */}
      <header className="theme-header pb-20 pt-6 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setHeroOpen(true)}
              className="flex items-center gap-3 text-left transition hover:opacity-90"
              title="Мой Герой"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-400/50 bg-black/30 text-3xl shadow-lg">
                {child?.avatarEmoji}
              </div>
              <div>
                <div className="text-lg font-extrabold drop-shadow">{child?.name}</div>
                <div className="text-sm text-amber-200/90">Мой Герой</div>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="rounded-xl bg-white/15 p-2.5 backdrop-blur transition hover:bg-white/25"
                title="Настройки"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={logout}
                className="rounded-xl bg-white/15 p-2.5 backdrop-blur transition hover:bg-white/25"
                title="Выйти"
              >
                <LogOut size={20} />
              </button>
            </div>
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
            homeStoreId={stores.find((s) => s.templateType === 'HOME')?.id ?? null}
            onNavigate={navigate}
            onOpenSkill={openSkill}
          />
        )}

        {tab === 'skills' &&
          (selectedSkill ? (
            <SkillPage
              config={skillById(selectedSkill)}
              store={storeForSkill(selectedSkill)}
              progress={skillProgress(selectedSkill)}
              onBack={() => setSelectedSkill(null)}
            />
          ) : (
            <div className="space-y-4">
              <h2 className="rpg-title text-xl">Навыки героя</h2>
              <p className="text-sm text-stone-400">
                Выбери направление, чтобы открыть его модуль: карточки, покупки, инвентарь и статистику.
              </p>
              <SkillsGrid skills={skills} onSelect={openSkill} />
            </div>
          ))}

        {tab === 'quests' && <ChildQuestsDailiesTab />}

        {tab === 'shops' && (
          <ChildShopsTab
            stores={stores}
            products={products}
            profile={profile}
            loading={stores.length === 0}
            onPurchased={afterPurchase}
          />
        )}

        {tab === 'inventory' && <ChildInventoryTab inventory={inventory} onReload={loadInventory} />}

        {tab === 'achievements' && <ChildAchievementsTab />}

        {tab === 'home' && !profile && <Spinner label="Загружаем главную…" />}
      </main>
    </div>
  );
}
