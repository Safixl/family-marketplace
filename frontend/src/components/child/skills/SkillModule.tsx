import { useCallback, useEffect, useState } from 'react';
import {
  Archive,
  BarChart3,
  History,
  Package,
  Send,
} from 'lucide-react';
import { api } from '../../../api/client';
import {
  ChildPurchaseDto,
  InventoryStackDto,
  SkillProgressDto,
  StoreDto,
} from '../../../api/types';
import { errMsg } from '../../../lib/format';
import { SkillConfig, SkillQuest, SkillRequestRow, SkillStats } from '../../../lib/skills';
import { Spinner } from '../../ui';
import ChildHouseView from '../ChildHouseView';
import ArchiveTab from './tabs/ArchiveTab';
import InventoryTab from './tabs/InventoryTab';
import PurchaseHistoryTab from './tabs/PurchaseHistoryTab';
import RequestsTab from './tabs/RequestsTab';
import StatsTab from './tabs/StatsTab';
import TaskCardsTab from './tabs/TaskCardsTab';

type TabId = 'archive' | 'requests' | 'history' | 'inventory' | 'stats';

const TABS: Array<{ id: TabId; label: string; icon: typeof Archive }> = [
  { id: 'archive', label: 'Архив', icon: Archive },
  { id: 'requests', label: 'Запросы', icon: Send },
  { id: 'history', label: 'Покупки', icon: History },
  { id: 'inventory', label: 'Инвентарь', icon: Package },
  { id: 'stats', label: 'Статистика', icon: BarChart3 },
];

interface Props {
  config: SkillConfig;
  store: StoreDto | null;
  progress: SkillProgressDto | undefined;
}

export default function SkillModule({ config, store, progress }: Props) {
  const [tab, setTab] = useState<TabId>('archive');
  const [loading, setLoading] = useState(true);
  const [archive, setArchive] = useState<Awaited<ReturnType<SkillConfig['loadArchive']>>>([]);
  const [requests, setRequests] = useState<SkillRequestRow[]>([]);
  const [stats, setStats] = useState<SkillStats>({ level: 0, progress: 0, counters: [] });
  const [quests, setQuests] = useState<SkillQuest[]>([]);
  const [purchases, setPurchases] = useState<ChildPurchaseDto[]>([]);
  const [inventory, setInventory] = useState<InventoryStackDto[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [arch, req, st, qu] = await Promise.all([
        config.loadArchive(),
        config.loadRequests(),
        config.loadStats(progress),
        config.loadQuests(),
      ]);
      setArchive(arch);
      setRequests(req);
      setStats(st);
      setQuests(qu);

      if (store) {
        const [allPurchases, allInventory] = await Promise.all([
          api.get<ChildPurchaseDto[]>('/child/purchases'),
          api.get<InventoryStackDto[]>('/child/inventory'),
        ]);
        setPurchases(allPurchases.filter((p) => p.storeId === store.id));
        setInventory(allInventory.filter((i) => i.storeId === store.id));
      } else {
        setPurchases([]);
        setInventory([]);
      }
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [config, store, progress]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Spinner label={`Загружаем «${config.name}»…`} />;

  return (
    <div className="space-y-4">
      {/* Вкладки */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const label = t.id === 'requests' ? config.requestTitle : t.label;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rpg-tab ${tab === t.id ? 'rpg-tab-active' : ''}`}
            >
              <Icon size={15} /> {label}
            </button>
          );
        })}
      </div>

      {tab === 'archive' &&
        (config.id === 'HOUSE' && store ? (
          <ChildHouseView storeId={store.id} />
        ) : (
          <ArchiveTab config={config} rows={archive} />
        ))}
      {tab === 'requests' &&
        (config.id === 'MATH' ? (
          <TaskCardsTab skill="MATH" />
        ) : config.id === 'HOUSE' ? (
          <TaskCardsTab skill="HOUSE" />
        ) : (
          <RequestsTab config={config} store={store} requests={requests} onReload={() => void load()} />
        ))}
      {tab === 'history' && <PurchaseHistoryTab purchases={purchases} />}
      {tab === 'inventory' && (
        <InventoryTab inventory={inventory} onReload={() => void load()} />
      )}
      {tab === 'stats' && <StatsTab config={config} stats={stats} quests={quests} />}
    </div>
  );
}
