export interface ThemeMeta {
  id: string;
  name: string;
  emoji: string;
  hint: string;
  /** Примерные возрастные предпочтения */
  age: string;
  /** Цвета для превью-карточки */
  preview: string;
}

export const THEMES: ThemeMeta[] = [
  { id: 'wow', name: 'RPG-герой', emoji: '⚔️', hint: 'Тёмное фэнтези в стиле WoW', age: '6–16 лет', preview: 'linear-gradient(135deg,#1c1917,#78350f,#b45309)' },
  { id: 'rainbow', name: 'Радуга', emoji: '🌈', hint: 'Ярко и весело', age: '4–8 лет', preview: 'linear-gradient(135deg,#4f46e5,#7c3aed,#c026d3)' },
  { id: 'space', name: 'Космос', emoji: '🚀', hint: 'Тёмный космос с неоном', age: '6–12 лет', preview: 'linear-gradient(135deg,#1e1b4b,#4c1d95,#7e22ce)' },
  { id: 'ocean', name: 'Океан', emoji: '🌊', hint: 'Свежий и спокойный', age: '5–10 лет', preview: 'linear-gradient(135deg,#0891b2,#0ea5e9,#2563eb)' },
  { id: 'forest', name: 'Лес', emoji: '🌲', hint: 'Природа и уют', age: '5–10 лет', preview: 'linear-gradient(135deg,#15803d,#16a34a,#65a30d)' },
  { id: 'sunset', name: 'Закат', emoji: '🌇', hint: 'Тёплый и уютный', age: '8–14 лет', preview: 'linear-gradient(135deg,#ea580c,#f43f5e,#d946ef)' },
  { id: 'minimal', name: 'Минимал', emoji: '⚪', hint: 'Спокойный, без ярких цветов', age: '12–18 лет', preview: 'linear-gradient(135deg,#334155,#475569,#64748b)' },
];

export function themeById(id: string): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
