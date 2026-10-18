import { ScrollText, Sparkles } from 'lucide-react';
import ChildDailiesTab from './ChildDailiesTab';
import ChildQuestsTab from './ChildQuestsTab';

/**
 * Объединённая вкладка «Квесты и Дейлики»:
 *  - «Дейлики на сегодня» — ежедневные задания по навыкам (ChildDailiesTab);
 *  - «Квесты ГМа» — сюжетные/повторяемые квесты со стадиями (ChildQuestsTab).
 */
export default function ChildQuestsDailiesTab() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="rpg-title mb-3 flex items-center gap-2 text-xl">
          <Sparkles size={20} className="text-amber-400" /> Дейлики на сегодня
        </h2>
        <ChildDailiesTab />
      </section>

      <section>
        <h2 className="rpg-title mb-3 flex items-center gap-2 text-xl">
          <ScrollText size={20} className="text-amber-400" /> Квесты ГМа
        </h2>
        <ChildQuestsTab />
      </section>
    </div>
  );
}