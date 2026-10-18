import { api } from '../api/client';
import {
  ChildBookDto,
  ChildReadingResponse,
  MathAttemptDto,
  MathStatsDto,
  MathTaskDto,
  ReadingRequestDto,
  SkillId,
  SkillProgressDto,
} from '../api/types';

/**
 * Конфигурация одного направления развития (навыка).
 * Все 6 навыков используют одинаковую модульную структуру из 6 вкладок,
 * отличаются только лейблы и источники данных.
 */

export interface SkillArchiveRow {
  id: number;
  title: string;
  author?: string;
  genre?: string;
  series?: string;
  pages?: number;
  points: number;
  status: 'DONE' | 'IN_PROGRESS' | 'PENDING';
  date?: string;
}

export interface SkillRequestRow {
  id: number;
  title: string;
  link?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface SkillCounter {
  label: string;
  value: string | number;
  icon?: string;
}

export interface SkillStats {
  level: number;
  progress: number;
  counters: SkillCounter[];
}

export interface SkillQuest {
  id: number;
  title: string;
  description?: string;
  points: number;
  done?: boolean;
}

export interface SkillConfig {
  id: SkillId;
  name: string;
  icon: string;
  /** Основной цвет для гексагона и акцентов */
  color: string;
  /** Tailwind-градиент для иконок/кнопок */
  gradient: string;
  /** Тип шаблона магазина, привязанного к навыку (READING/MATH/HOME) или null */
  storeTemplate: string | null;
  /** Вкладка 1: архив */
  archiveTitle: string;
  archiveEmpty: string;
  /** Вкладка 2: запросы */
  requestTitle: string;
  requestPlaceholder: string;
  /** Вкладка 6: статистика */
  statsTitle: string;
  loadArchive: () => Promise<SkillArchiveRow[]>;
  loadRequests: () => Promise<SkillRequestRow[]>;
  loadStats: (progress: SkillProgressDto | undefined) => Promise<SkillStats>;
  loadQuests: () => Promise<SkillQuest[]>;
}

// ---------- Нормализация данных ----------

function readingToArchive(books: ChildBookDto[]): SkillArchiveRow[] {
  return books.map((b) => ({
    id: b.id,
    title: b.name,
    author: b.author ?? undefined,
    genre: b.genre ?? undefined,
    series: b.series ?? undefined,
    pages: b.pages,
    points: Math.round(b.pages * b.multiplier),
    status: b.status === 'APPROVED' ? 'DONE' : b.status === 'PENDING' ? 'PENDING' : 'IN_PROGRESS',
  }));
}

function readingRequestsToRows(requests: ReadingRequestDto[]): SkillRequestRow[] {
  return requests.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

function mathAttemptsToArchive(attempts: MathAttemptDto[]): SkillArchiveRow[] {
  return attempts.map((a) => ({
    id: a.id,
    title: a.taskTitle,
    points: a.points,
    status: a.correct ? 'DONE' : 'PENDING',
    date: a.attemptedAt,
  }));
}

// ---------- Конфигурации навыков ----------

export const SKILLS: SkillConfig[] = [
  {
    id: 'MATH',
    name: 'Математика',
    icon: '🧮',
    color: '#38bdf8',
    gradient: 'from-sky-500 to-blue-600',
    storeTemplate: 'MATH',
    archiveTitle: 'Архив решённых задач',
    archiveEmpty: 'Решённые задачи появятся здесь',
    requestTitle: 'Карточки с заданиями',
    requestPlaceholder: 'Карточки с заданиями разной сложности и наградами',
    statsTitle: 'Статистика по математике',
    loadArchive: async () => {
      try {
        const stats = await api.get<MathStatsDto>('/child/math-stats');
        return mathAttemptsToArchive(stats.attempts);
      } catch {
        return [];
      }
    },
    loadRequests: async () => [],
    loadStats: async (progress) => {
      try {
        const stats = await api.get<MathStatsDto>('/child/math-stats');
        return {
          level: progress?.progress ?? 0,
          progress: progress?.progress ?? 0,
          counters: [
            { label: 'Решено задач', value: stats.correct, icon: '✅' },
            { label: 'Попыток', value: stats.total, icon: '🎯' },
            { label: 'Баллов заработано', value: stats.pointsEarned, icon: '⭐' },
            { label: 'Ачивок получено', value: progress?.unlockedAchievements ?? 0, icon: '🏆' },
          ],
        };
      } catch {
        return { level: 0, progress: 0, counters: [] };
      }
    },
    loadQuests: async () => {
      try {
        const tasks = await api.get<MathTaskDto[]>('/child/tasks');
        return tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description ?? undefined,
          points: t.points,
        }));
      } catch {
        return [];
      }
    },
  },
  {
    id: 'READING',
    name: 'Чтение',
    icon: '📚',
    color: '#fbbf24',
    gradient: 'from-amber-400 to-orange-500',
    storeTemplate: 'READING',
    archiveTitle: 'Прочитанные книги',
    archiveEmpty: 'Прочитанные книги появятся здесь',
    requestTitle: 'Запрос на добавление книги',
    requestPlaceholder: 'Название или ссылка на книгу, которую читаю…',
    statsTitle: 'Статистика по чтению',
    loadArchive: async () => {
      try {
        const data = await api.get<ChildReadingResponse>('/child/reading');
        return readingToArchive(data.books);
      } catch {
        return [];
      }
    },
    loadRequests: async () => {
      try {
        const data = await api.get<ChildReadingResponse>('/child/reading');
        return readingRequestsToRows(data.requests);
      } catch {
        return [];
      }
    },
    loadStats: async (progress) => {
      try {
        const data = await api.get<ChildReadingResponse>('/child/reading');
        const genres = new Set(data.books.map((b) => b.genre).filter(Boolean)).size;
        return {
          level: progress?.progress ?? 0,
          progress: progress?.progress ?? 0,
          counters: [
            { label: 'Книг засчитано', value: data.stats.booksRead, icon: '📖' },
            { label: 'Страниц прочитано', value: data.stats.pagesRead, icon: '📄' },
            { label: 'Страниц сегодня', value: `${data.pagesToday}/${data.pagesTarget}`, icon: '📅' },
            { label: 'Жанров', value: genres, icon: '🎭' },
            { label: 'Баллов заработано', value: data.stats.pointsEarned, icon: '⭐' },
            { label: 'Ачивок получено', value: progress?.unlockedAchievements ?? 0, icon: '🏆' },
          ],
        };
      } catch {
        return { level: 0, progress: 0, counters: [] };
      }
    },
    loadQuests: async () => [],
  },
  {
    id: 'LOGIC',
    name: 'Логика',
    icon: '🧩',
    color: '#a78bfa',
    gradient: 'from-violet-400 to-purple-600',
    storeTemplate: null,
    archiveTitle: 'Архив выполненного',
    archiveEmpty: 'Выполненные задания по логике появятся здесь',
    requestTitle: 'Запрос на добавление задания',
    requestPlaceholder: 'Какое задание по логике нужно?',
    statsTitle: 'Статистика по логике',
    loadArchive: async () => [],
    loadRequests: async () => [],
    loadStats: async (progress) => ({
      level: progress?.progress ?? 0,
      progress: progress?.progress ?? 0,
      counters: [
        { label: 'Ачивок получено', value: progress?.unlockedAchievements ?? 0, icon: '🏆' },
        { label: 'Прогресс навыка', value: `${progress?.progress ?? 0}%`, icon: '📈' },
      ],
    }),
    loadQuests: async () => [],
  },
  {
    id: 'LANG',
    name: 'Иностранный язык',
    icon: '🌍',
    color: '#34d399',
    gradient: 'from-emerald-400 to-teal-600',
    storeTemplate: null,
    archiveTitle: 'Архив выполненного',
    archiveEmpty: 'Выполненные задания по языку появятся здесь',
    requestTitle: 'Запрос на добавление задания',
    requestPlaceholder: 'Какое задание по языку нужно?',
    statsTitle: 'Статистика по языку',
    loadArchive: async () => [],
    loadRequests: async () => [],
    loadStats: async (progress) => ({
      level: progress?.progress ?? 0,
      progress: progress?.progress ?? 0,
      counters: [
        { label: 'Ачивок получено', value: progress?.unlockedAchievements ?? 0, icon: '🏆' },
        { label: 'Прогресс навыка', value: `${progress?.progress ?? 0}%`, icon: '📈' },
      ],
    }),
    loadQuests: async () => [],
  },
  {
    id: 'SPORT',
    name: 'Спорт и хобби',
    icon: '⚽',
    color: '#fb7185',
    gradient: 'from-rose-400 to-red-500',
    storeTemplate: null,
    archiveTitle: 'Архив выполненного',
    archiveEmpty: 'Выполненные задания по спорту и хобби появятся здесь',
    requestTitle: 'Запрос на добавление задания',
    requestPlaceholder: 'Какое задание по спорту/хобби нужно?',
    statsTitle: 'Статистика по спорту и хобби',
    loadArchive: async () => [],
    loadRequests: async () => [],
    loadStats: async (progress) => ({
      level: progress?.progress ?? 0,
      progress: progress?.progress ?? 0,
      counters: [
        { label: 'Ачивок получено', value: progress?.unlockedAchievements ?? 0, icon: '🏆' },
        { label: 'Прогресс навыка', value: `${progress?.progress ?? 0}%`, icon: '📈' },
      ],
    }),
    loadQuests: async () => [],
  },
  {
    id: 'HOUSE',
    name: 'Порядок в комнате',
    icon: '🏠',
    color: '#4ade80',
    gradient: 'from-green-400 to-emerald-600',
    storeTemplate: 'HOME',
    archiveTitle: 'Календарь уборки',
    archiveEmpty: 'Отмеченные дни появятся здесь',
    requestTitle: 'Помощь по дому',
    requestPlaceholder: 'Карточки помощи по дому с бонусом в календарь',
    statsTitle: 'Статистика по порядку в комнате',
    loadArchive: async () => [],
    loadRequests: async () => [],
    loadStats: async (progress) => ({
      level: progress?.progress ?? 0,
      progress: progress?.progress ?? 0,
      counters: [
        { label: 'Ачивок получено', value: progress?.unlockedAchievements ?? 0, icon: '🏆' },
        { label: 'Прогресс навыка', value: `${progress?.progress ?? 0}%`, icon: '📈' },
      ],
    }),
    loadQuests: async () => [],
  },
];

export function skillById(id: SkillId): SkillConfig {
  return SKILLS.find((s) => s.id === id) ?? SKILLS[0];
}

export function skillByStoreTemplate(template: string | null): SkillConfig | undefined {
  if (!template) return undefined;
  return SKILLS.find((s) => s.storeTemplate === template);
}
