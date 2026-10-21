/** Шкала оценки порядка в комнате (навык «Порядок в комнате»). */
export interface RoomRating {
  value: number;
  label: string;
  icon: string;
  hint: string;
}

export const ROOM_RATINGS: RoomRating[] = [
  {
    value: -2,
    label: 'Зона бедствия',
    icon: '☣️',
    hint: 'Штраф -2 🪙 · Требуется срочная эвакуация хлама',
  },
  {
    value: -1,
    label: 'Запустение',
    icon: '🏚️',
    hint: 'Штраф -1 🪙 · Пора браться за ум и за тряпку',
  },
  {
    value: 0,
    label: 'Бытовой хаос',
    icon: '🌀',
    hint: '0 🪙 · Нейтрально, жить можно',
  },
  {
    value: 1,
    label: 'Чисто',
    icon: '✨',
    hint: 'Выплата +1 🪙 · Базовый порядок наведён',
  },
  {
    value: 2,
    label: 'Идеальный порядок',
    icon: '👑',
    hint: 'Выплата +2 🪙 · Комната как с обложки журнала',
  },
];

/** Цвет по оценке: отрицательный/ноль/положительный. */
export function ratingTone(value: number): 'neg' | 'zero' | 'pos' {
  if (value < 0) return 'neg';
  if (value > 0) return 'pos';
  return 'zero';
}
