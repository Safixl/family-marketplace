import { ProductLimitPeriod } from '../api/types';

/** Подписи периодов лимита: как часто обновляется лимит покупок товара. */
export const LIMIT_PERIOD_LABELS: Record<ProductLimitPeriod, string> = {
  NONE: 'Один раз всего (не обновляется)',
  DAILY: 'Каждый день в 9:00',
  WEEKLY: 'Каждый понедельник в 9:00',
  MONTHLY: '1-го числа в 9:00',
};

/** Короткая подпись периода для карточек товара. */
export const LIMIT_PERIOD_SHORT: Record<ProductLimitPeriod, string> = {
  NONE: 'всего',
  DAILY: 'в день',
  WEEKLY: 'в неделю',
  MONTHLY: 'в месяц',
};

const OPTIONS: ProductLimitPeriod[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'];

/** Ближайший сброс лимита в читаемом виде (например, «24.11, 09:00»). */
export function fmtLimitReset(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  value: ProductLimitPeriod;
  /** Период имеет смысл только при заданном лимите. */
  disabled?: boolean;
  onChange: (value: ProductLimitPeriod) => void;
}

/**
 * Выбор периодичности лимита товара в форме родителя.
 * «Один раз всего» — товар исчезает после покупки всех штук навсегда.
 * Остальные варианты — лимит обновляется в 9:00 МСК, и товар снова появляется.
 */
export default function LimitPeriodSelect({ value, disabled, onChange }: Props) {
  return (
    <div>
      <label className="label">Лимит обновляется</label>
      <select
        className="input"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as ProductLimitPeriod)}
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {LIMIT_PERIOD_LABELS[option]}
          </option>
        ))}
      </select>
      {!disabled && value !== 'NONE' && (
        <p className="mt-1 text-xs text-slate-400">
          После покупки всех штук товар скроется из магазина ребёнка до следующего сброса.
        </p>
      )}
    </div>
  );
}
