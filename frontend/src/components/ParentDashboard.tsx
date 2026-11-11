import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import {
  BookOpen,
  Calculator,
  Dumbbell,
  Globe2,
  Home,
  LayoutDashboard,
  LogOut,
  Puzzle,
  ScrollText,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, downloadFile } from '../api/client';
import { ChildDto, SkillActivationDto } from '../api/types';
import { NotificationBell, NotificationPanel } from './NotificationCenter';
import ChildrenTab from './tabs/ChildrenTab';
import OverviewTab from './tabs/OverviewTab';
import QuestsTab from './tabs/QuestsTab';
import ReadingTab from './tabs/ReadingTab';
import MathTab from './tabs/MathTab';
import LogicTab from './tabs/LogicTab';
import LangTab from './tabs/LangTab';
import SportTab from './tabs/SportTab';
import HouseTab from './tabs/HouseTab';

type TabId =
  | 'overview'
  | 'children'
  | 'reading'
  | 'math'
  | 'logic'
  | 'lang'
  | 'sport'
  | 'house'
  | 'quests';

const TABS: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'children', label: 'Дети', icon: Users },
  { id: 'overview', label: 'Профиль ребенка', icon: LayoutDashboard },
  { id: 'reading', label: 'Чтение', icon: BookOpen },
  { id: 'math', label: 'Математика', icon: Calculator },
  { id: 'logic', label: 'Логика', icon: Puzzle },
  { id: 'lang', label: 'Иностранный язык', icon: Globe2 },
  { id: 'sport', label: 'Спорт и хобби', icon: Dumbbell },
  { id: 'house', label: 'Хозяйственность', icon: Home },
  { id: 'quests', label: 'Квесты', icon: ScrollText },
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

  /** Скачивание CSV-отчёта (дети, достижения, покупки). */
  const exportReport = async () => {
    try {
      const blob = await downloadFile('/parent/export/report.csv');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `family-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Не удалось скачать отчёт');
    }
  };
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
      setNotifCount((prev) => {
        // Новые уведомления появились — показать системное браузерное уведомление
        if (count > prev && count > 0 && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
          new Notification('Дейлики', { body: 'У ребёнка новые события — загляните в уведомления' });
        }
        return count;
      });
    } catch {
      // тихо — бейдж просто не обновится
    }
  }, []);

  /** Разрешение на браузерные уведомления (запрашивается мягко, при клике на колокольчик). */
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
    setNotifOpen(true);
  };

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

  /** Запрос на создание ребёнка из кнопки «Дети» (seq — чтобы повторный клик снова открывал форму). */
  const [childCreate, setChildCreate] = useState<{ seq: number } | null>(null);
  const startChildCreate = useCallback(() => {
    setTab('children');
    setChildCreate((prev) => ({ seq: (prev?.seq ?? 0) + 1 }));
  }, []);

  /** Вкладки, доступные для выбранного ребёнка (навыковые — только при активации).
   *  Пока детей нет — доступна только вкладка «Дети». */
  const visibleTabs = (children.length === 0 ? TABS.filter((t) => t.id === 'children') : TABS).filter((t) => {
    const skill = TAB_SKILL[t.id];
    return !skill || activeSkillCodes.includes(skill);
  });

  // Нет детей (или их ещё не загрузили) → открываем вкладку «Дети»
  useEffect(() => {
    if (children.length === 0) {
      setTab('children');
    }
  }, [children.length]);

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
          <ChildPicker
            childrenList={children}
            selectedChildId={selectedChildId}
            tabActive={tab === 'children'}
            variant="sidebar"
            onOpenTab={() => setTab('children')}
            onSelect={(id) => setSelectedChildId(id)}
            onCreate={startChildCreate}
          />
          {visibleTabs
            .filter((t) => t.id !== 'children')
            .map((t) => {
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
            <NotificationBell count={notifCount} onClick={requestNotificationPermission} />
          </div>
          <button
            onClick={() => void exportReport()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            ⬇️ Экспорт отчёта
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </aside>

      {/* Шапка (мобильный) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-slate-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 text-white">
          <Zap size={20} className="text-indigo-400" />
          <span className="font-bold">Дейлики</span>
        </div>
        <ChildPicker
          childrenList={children}
          selectedChildId={selectedChildId}
          tabActive={tab === 'children'}
          variant="mobile"
          onOpenTab={() => setTab('children')}
          onSelect={(id) => setSelectedChildId(id)}
          onCreate={startChildCreate}
        />
        <div className="flex items-center gap-1">
          <NotificationBell count={notifCount} onClick={requestNotificationPermission} />
          <button onClick={logout} className="rounded-xl p-2 text-slate-300 hover:bg-slate-800" title="Выйти">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Контент */}
      <main className="px-4 pb-24 pt-6 sm:px-6 lg:ml-64 lg:pb-10">
        <div className="mx-auto max-w-6xl">
          {tab === 'overview' && (
            <OverviewTab selectedChildId={selectedChildId} onCreateQuest={startQuestCreate} onSkillsChanged={handleSkillsChanged} />
          )}
          {tab === 'children' && (
            <ChildrenTab
              onChanged={handleChildrenChanged}
              createRequest={childCreate}
              onCreateConsumed={() => setChildCreate(null)}
            />
          )}
          {tab === 'reading' && <ReadingTab selectedChildId={selectedChildId} />}
          {tab === 'math' && <MathTab selectedChildId={selectedChildId} />}
          {tab === 'logic' && <LogicTab selectedChildId={selectedChildId} />}
          {tab === 'lang' && <LangTab selectedChildId={selectedChildId} />}
          {tab === 'sport' && <SportTab selectedChildId={selectedChildId} />}
          {tab === 'house' && <HouseTab selectedChildId={selectedChildId} />}
          {tab === 'quests' && (
            <QuestsTab
              selectedChildId={selectedChildId}
              createRequest={questCreate}
              onCreateConsumed={() => setQuestCreate(null)}
            />
          )}
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

/**
 * Кнопка «Дети»: левая часть — переход во вкладку «Дети»,
 * правая — выбранный ребёнок (при >1 детях по клику открывается список выбора
 * с пунктом «+ Добавить ребёнка»).
 */
function ChildPicker({
  childrenList,
  selectedChildId,
  tabActive,
  variant,
  onOpenTab,
  onSelect,
  onCreate,
}: {
  childrenList: ChildDto[];
  selectedChildId: number | null;
  tabActive: boolean;
  variant: 'sidebar' | 'mobile';
  onOpenTab: () => void;
  onSelect: (id: number) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = childrenList.find((c) => c.id === selectedChildId) ?? null;
  const compact = variant === 'mobile';

  return (
    <div className="relative">
      <div
        className={`flex overflow-hidden rounded-xl ${
          compact ? 'bg-slate-800/70' : tabActive ? 'bg-indigo-600' : 'bg-slate-800/60'
        }`}
      >
        {/* Левая часть: переход во вкладку «Дети» */}
        <button
          onClick={() => {
            setOpen(false);
            onOpenTab();
          }}
          className={`flex items-center gap-2 px-3 py-2 font-medium transition-colors ${
            compact ? 'text-white' : 'flex-1 gap-3 px-3 py-2.5 text-sm'
          } ${tabActive || compact ? 'text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        >
          <Users size={compact ? 14 : 18} /> Дети
        </button>
        {/* Правая часть: выбранный ребёнок (выбор открывается, если детей больше 1) */}
        {selected && (
          childrenList.length > 1 ? (
            <button
              onClick={() => setOpen((v) => !v)}
              className={`flex items-center gap-1.5 border-l border-slate-700/60 px-2.5 transition-colors ${
                compact ? 'py-1.5 text-white' : 'py-2.5 text-sm text-slate-200 hover:bg-slate-800'
              }`}
              title="Выбрать ребёнка"
            >
              <span className={`truncate ${compact ? 'max-w-[90px]' : 'max-w-[110px]'}`}>
                {selected.avatarEmoji} {selected.name}
              </span>
              <ChevronDown size={compact ? 12 : 14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <span
              className={`flex items-center gap-1.5 border-l border-slate-700/60 px-2.5 ${
                compact ? 'py-1.5 text-white' : 'py-2.5 text-sm text-slate-200'
              }`}
            >
              <span className={`truncate ${compact ? 'max-w-[90px]' : 'max-w-[110px]'}`}>
                {selected.avatarEmoji} {selected.name}
              </span>
            </span>
          )
        )}
      </div>

      {/* Выпадающий список: выбор ребёнка + добавление нового */}
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div
            className={`absolute top-full z-30 mt-1 rounded-xl border border-slate-700 bg-slate-800 p-1.5 shadow-2xl ${
              compact ? 'right-0 w-56' : 'left-0 right-0'
            }`}
          >
            {childrenList.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  c.id === selectedChildId ? 'bg-indigo-600 text-white' : 'text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span>{c.avatarEmoji}</span>
                <span className="min-w-0 flex-1 truncate text-left">{c.name}</span>
                {c.id === selectedChildId && <Check size={14} />}
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onCreate();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-amber-300 transition-colors hover:bg-slate-700"
            >
              <Plus size={14} /> Добавить ребёнка
            </button>
          </div>
        </>
      )}
    </div>
  );
}