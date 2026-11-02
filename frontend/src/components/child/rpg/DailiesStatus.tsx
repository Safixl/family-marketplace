import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export interface DailiesTasks {
  tasksDone?: number;
  tasksTotal?: number;
  tasksOk?: number;
  tasksFail?: number;
}

export type DailiesStatusKind = 'progress' | 'done-ok' | 'done-fail' | 'mixed';

/**
 * Статус дейлика по заданиям:
 *  - не всё выполнено → синий восклицательный знак;
 *  - всё выполнено положительно → зелёная галочка;
 *  - всё выполнено отрицательно → красный крестик;
 *  - смесь плюсов и минусов → жёлтый квадратик.
 */
export function dailiesStatus(s: DailiesTasks): {
  kind: DailiesStatusKind;
  node: ReactNode;
  counter: string;
} {
  const done = s.tasksDone ?? 0;
  const total = s.tasksTotal ?? 0;
  const ok = s.tasksOk ?? 0;
  const fail = s.tasksFail ?? 0;
  const counter = `${done}/${total}`;

  if (total > 0 && done >= total) {
    if (fail === 0) {
      return { kind: 'done-ok', node: <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />, counter };
    }
    if (ok === 0) {
      return { kind: 'done-fail', node: <XCircle size={14} className="shrink-0 text-rose-500" />, counter };
    }
    return {
      kind: 'mixed',
      node: <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm bg-amber-400" aria-label="часть заданий провалена" />,
      counter,
    };
  }
  return { kind: 'progress', node: <AlertCircle size={14} className="shrink-0 text-sky-500" />, counter };
}
