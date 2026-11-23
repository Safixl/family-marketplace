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

const TABS: Array<{ id: Tab; label: string; shortLabel: string; icon: typeof Home }> = [
  { id: 'home', label: 'Главная', shortLabel: 'Главная', icon: Home },
  { id: 'quests', label: 'Квесты и Дейлики', shortLabel: 'Квесты', icon: ScrollText },
  { id: 'shops', label: 'Магазины', shortLabel: 'Магазины', icon: Store },
  { id: 'inventory', label: 'Инвентарь', shortLabel: 'Сумка', icon: Package },
  { id: 'skills', label: 'Навыки', shortLabel: 'Навыки', icon: Swords },
  { id: 'achievements', label: 'Достижения', shortLabel: 'Ачивки', icon: Trophy },
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
    void loadInventory();
    void loadAchievements();
    void loadSkills();
    void loadSettings();
  }, [loadProfile, loadInventory, loadAchievements, loadSkills, loadSettings]);

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
  const loadLevel = useCallback(async () => {
    try {
      setServerLevel(await api.get<LevelDto>('/child/level'));
    } catch {
      // используем локальный расчёт
    }
  }, []);

  useEffect(() => {
    void loadLevel();
  }, [loadLevel, skills.length]);

  // Родитель может одобрить квест, пока ребёнок на другой вкладке: без перезагрузки
  // подтягиваем балансы, навыки, инвентарь, ачивки и уровень — по таймеру и при возврате на страницу.
  useEffect(() => {
    const refresh = () => {
      if (document.hidden) return;
      void loadProfile();
      void loadSkills();
      void loadInventory();
      void loadAchievements();
      void loadLevel();
    };
    const timer = window.setInterval(refresh, 20000);
    const onFocus = () => refresh();
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadProfile, loadSkills, loadInventory, loadAchievements, loadLevel]);

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
    <div className="theme-body min-h-dvh">
      <AchievementPopup childId={child?.id ?? 0} achievements={achievements} />

      {heroOpen && child && (
        <MyHeroPanel childName={child.name} avatarEmoji={child.avatarEmoji} onClose={() => setHeroOpen(false)} />
      )}

      {settingsOpen && (
        <div className="scroll-touch fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 px-safe-4 py-safe-4 backdrop-blur-sm sm:items-center">
          <div className="rpg-panel rpg-panel-gold w-full max-w-2xl p-4 sm:p-6">
            <ChildSettingsTab
              profile={profile}
              settings={settings}
              onThemeChange={(t) => void changeTheme(t)}
              onWidgetsChange={(w) => void changeWidgets(w)}
            />
            <div className="mt-4 flex justify-end">
              <button className="rpg-btn rpg-btn-ghost touch-target" onClick={() => setSettingsOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Шапка героя */}
      <header className="theme-header safe-header landscape-compact-header pb-6 text-white sm:pb-20">
        <div className="mx-auto max-w-5xl px-page">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setHeroOpen(true)}
              className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-90"
              title="Мой Герой"
            >
              <div className="landscape-compact-avatar flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-400/50 bg-black/30 text-3xl shadow-lg">
                {child?.avatarEmoji}
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold drop-shadow">{child?.name}</div>
                <div className="landscape-hide text-sm text-amber-200/90">Мой Герой</div>
              </div>
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="touch-target flex items-center justify-center rounded-xl bg-white/15 p-2.5 backdrop-blur transition hover:bg-white/25"
                title="Настройки"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={logout}
                className="touch-target flex items-center justify-center rounded-xl bg-white/15 p-2.5 backdrop-blur transition hover:bg-white/25"
                title="Выйти"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Уровень и опыт */}
          <div className="landscape-compact-gap mt-4">
            <LevelBar level={level} />
          </div>

          {/* Балансы */}
          {profile && profile.balances.length > 0 && (
            <div className="mt-3 flex max-w-full flex-wrap gap-2">
              {profile.balances.map((b) => (
                <div
                  key={b.storeId}
                  className="flex min-w-0 max-w-full items-center gap-1 rounded-xl border border-amber-400/30 bg-black/25 px-3 py-1.5 text-xs font-semibold backdrop-blur sm:px-4 sm:py-2 sm:text-sm"
                >
                  <span className="shrink-0">{b.currencyIcon}</span>
                  <span className="truncate">{fmtAmount(b.amount, b.currencyName)}</span>
                  <span className="hidden truncate font-normal text-white/70 sm:inline">· {b.storeName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Вкладки (десктоп) */}
      <nav className="sticky top-0 z-20 -mt-12 mb-6 hidden px-page sm:block">
        <div className="no-scrollbar mx-auto flex max-w-5xl gap-1 overflow-x-auto rounded-2xl border border-amber-900/40 bg-stone-900/95 p-1.5 shadow-xl backdrop-blur">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.id)}
                className={`rpg-tab flex-1 justify-center whitespace-nowrap ${tab === t.id ? 'rpg-tab-active' : ''}`}
              >
                <Icon size={17} /> {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-page pb-mobile-nav sm:pb-12">
        {tab === 'home' && (
          <ChildHomeTab
            achievements={achievements}
            skills={skills}
            level={level}
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

      {/* Вкладки (мобильные): все шесть разделов всегда на виду, без скролла вбок */}
      <nav className="safe-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-amber-900/40 bg-stone-900/95 px-1 pt-1 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-0.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.id)}
                className={`flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[10px] font-semibold leading-tight transition ${
                  tab === t.id ? 'bg-amber-900/35 text-amber-300' : 'text-stone-400 active:bg-white/5'
                }`}
              >
                <Icon size={19} />
                <span className="w-full truncate text-center">{t.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
