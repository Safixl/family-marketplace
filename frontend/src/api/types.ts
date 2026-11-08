export interface UserDto {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface ChildDto {
  id: number;
  name: string;
  avatarEmoji: string;
  accessKey: string;
  active: boolean;
  /** Возраст вычисляется автоматически из даты рождения. */
  age: number | null;
  /** Дата рождения в формате YYYY-MM-DD. */
  birthDate: string | null;
  createdAt: string;
}

export interface StoreDto {
  id: number;
  name: string;
  description: string | null;
  currencyName: string;
  currencyIcon: string;
  active: boolean;
  templateType: string | null;
  wardrobe: boolean;
  createdAt: string;
}

export interface StoreTemplateDto {
  slug: string;
  name: string;
  description: string;
  currencyName: string;
  currencyIcon: string;
  type: string;
}

export interface ProductDto {
  id: number;
  storeId: number;
  name: string;
  description: string | null;
  price: number;
  limitPerChild: number | null;
  active: boolean;
  effectType: string;
  effectLimit: string | null;
  effectValue: number;
}

export interface ChildProductDto {
  id: number;
  storeId: number;
  storeName: string;
  name: string;
  description: string | null;
  price: number;
  limitPerChild: number | null;
  currencyName: string;
  currencyIcon: string;
  boughtCount: number;
  hasPending: boolean;
}

export type PurchaseStatus = 'PENDING' | 'PAID' | 'REJECTED';

export interface PurchaseDto {
  id: number;
  childId: number;
  childName: string;
  childAvatar: string;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  amount: number;
  status: PurchaseStatus;
  createdAt: string;
  confirmedAt: string | null;
  currencyName: string;
  currencyIcon: string;
}

export interface ChildPurchaseDto {
  id: number;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  amount: number;
  status: PurchaseStatus;
  createdAt: string;
  confirmedAt: string | null;
  currencyName: string;
  currencyIcon: string;
}

export interface BalanceRowDto {
  childId: number;
  childName: string;
  childAvatar: string;
  storeId: number;
  storeName: string;
  currencyName: string;
  currencyIcon: string;
  amount: number;
}

export interface AchievementDto {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  rewardAmount: number;
  targetType: string;
  targetValue: number;
  groupKey: string | null;
  skill: string | null;
  level: number;
  hiddenReward: boolean;
  rewardStoreId: number | null;
  xpReward: number;
  title: string | null;
  createdAt: string;
}

export interface ChildAchievementGroupDto {
  achievementId: number;
  groupKey: string | null;
  name: string;
  xpReward: number;
  description: string | null;
  icon: string;
  targetType: string;
  targetValue: number;
  progress: number;
  levelName: string;
  skill: string | null;
  level: number;
  rewardAmount: number | null;
  hiddenReward: boolean;
  unlocked: boolean;
  completed: boolean;
  /** Серийный книжный квест: названия книг чек-листа (null — не квест). */
  questBooks: string[] | null;
  /** Статусы прочтения книг чек-листа (true — прочитана). */
  questRead: boolean[] | null;
}

/** Сколько ступеней достижений есть и получено по навыку (полоска прогресса). */
export interface SkillTotalDto {
  skill: string;
  total: number;
  unlocked: number;
}

export interface PurchasedItemDto {
  productId: number;
  productName: string;
  price: number;
  storeId: number;
  storeName: string;
  currencyName: string;
  currencyIcon: string;
  confirmedAt: string | null;
}

export interface WishlistItemDto {
  id: number;
  childId: number;
  childName: string;
  title: string;
  link: string | null;
  price: number | null;
  desire: number;
  status: 'OPEN' | 'DONE';
  createdAt: string;
}

export interface GrantResult {
  achievementId: number;
  childId: number;
  rewardCredited: number;
  storeId: number | null;
}

export interface ChildProfileResponse {
  child: { id: number; name: string; avatarEmoji: string };
  balances: Array<{
    storeId: number;
    storeName: string;
    currencyName: string;
    currencyIcon: string;
    amount: number;
  }>;
  stats: { paidCount: number; paidTotal: number };
  achievements: Array<{
    id: number;
    name: string;
    description: string | null;
    icon: string;
    unlockedAt: string;
  }>;
  purchasedItems: PurchasedItemDto[];
}

export interface ChildSettingsDto {
  theme: string;
  homeWidgets: string[];
}

// ---------- Лимиты экрана и карманные деньги ----------

export interface ChildLimitsDto {
  childId: number;
  tvMinutes: number;
  pcMinutes: number;
  consoleMinutes: number;
  phoneMinutes: number;
  tabletMinutes: number;
  pocketWeekly: number;
}

export interface LimitTypeState {
  type: string;
  baseMinutes: number;
  usedSeconds: number;
  extendedSeconds: number;
  remainingSeconds: number;
  running: boolean;
  frozen: boolean;
  /** Включён ли лимит родителем (выключенные видны только родителю). */
  enabled: boolean;
  /** Название кастомного лимита (для стандартных — null). */
  label?: string | null;
}

export interface CustomLimitInput {
  id?: string | null;
  name: string;
  minutes: number;
  enabled: boolean;
}

export interface LimitEventDto {
  id: number;
  limitType: string;
  action: 'START' | 'STOP';
  seconds: number;
  createdAt: string;
}

export interface PocketState {
  weeklyLimit: number;
  spentThisWeek: number;
  remaining: number;
}

export interface LimitStateDto {
  limits: LimitTypeState[];
  pocket: PocketState;
}

export interface PocketRequestDto {
  id: number;
  childId: number;
  childName: string;
  childAvatar: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt: string | null;
}

// ---------- Шаблонные магазины: чтение / математика / дом ----------

export interface ReadingBookDto {
  id: number;
  storeId: number;
  childId: number | null;
  name: string;
  author: string | null;
  series: string | null;
  genre: string | null;
  pages: number;
  multiplier: number;
  active: boolean;
  createdAt: string;
  /** Текущая страница ребёнка (закладка), null — не начинал. */
  currentPage: number | null;
}

export type ReadingLogStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReadingLogDto {
  id: number;
  childId: number;
  bookId: number;
  bookName: string;
  author: string | null;
  pages: number;
  multiplier: number;
  points: number;
  status: ReadingLogStatus;
  readAt: string;
}

export interface ReadingStatsDto {
  booksRead: number;
  pagesRead: number;
  pointsEarned: number;
  pendingCount: number;
  pendingPoints: number;
  logs: ReadingLogDto[];
}

export interface ReadingRequestDto {
  id: number;
  childId: number;
  childName: string;
  storeId: number;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt: string | null;
}

export interface ChildBookDto {
  id: number;
  name: string;
  author: string | null;
  series: string | null;
  genre: string | null;
  pages: number;
  multiplier: number;
  status: ReadingLogStatus | null;
  currentPage: number | null;
}

export interface ChildReadingResponse {
  books: ChildBookDto[];
  requests: ReadingRequestDto[];
  stats: ReadingStatsDto;
  bookmarks: Record<number, number>;
  pagesToday: number;
  pagesTarget: number;
}

export interface ReadingSettingsDto {
  childId: number;
  storeId: number | null;
  pagesTarget: number;
  rewardAmount: number;
  xpReward: number;
}

/** Заготовка книги из достижений (серийные книжные квесты). */
export interface ReadingCatalogBookDto {
  id: string;
  name: string;
  author: string | null;
  series: string | null;
  genre: string;
  pages: number;
  quest: string;
  /** Прочитана ли книга ребёнком (одобренный лог с таким названием). */
  read: boolean;
}

export interface MathTaskDto {
  id: number;
  storeId: number;
  childId: number | null;
  title: string;
  description: string | null;
  points: number;
  active: boolean;
  createdAt: string;
}

// ---------- Карточки с заданиями (математика / помощь по дому) ----------

export interface TaskItem {
  q: string;
  a: string;
}

export interface TaskCardDto {
  id: number;
  /** id записи child_task_cards (для взятой ребёнком карточки) */
  childCardId: number | null;
  skill: string;
  title: string;
  description: string | null;
  icon: string;
  difficulty: string;
  tasks: TaskItem[];
  durationMinutes: number;
  rewardAmount: number;
  rewardStoreId: number | null;
  currencyName: string | null;
  currencyIcon: string | null;
  xpReward: number;
  houseBonus: number;
  rarity: string;
  hiddenReward: boolean;
  successPercent: number;
  active: boolean;
  childStatus: string | null;
  startedAt: string | null;
  resultPercent: number | null;
}

export interface MathAttemptDto {
  id: number;
  taskId: number;
  taskTitle: string;
  answer: string;
  correct: boolean;
  points: number;
  attemptedAt: string;
}

export interface MathStatsDto {
  solved: number;
  total: number;
  correct: number;
  pointsEarned: number;
  attempts: MathAttemptDto[];
}

export interface MathSolveResult {
  correct: boolean;
  points: number;
  correctAnswer: string;
}

export interface HouseDayDto {
  id: number;
  storeId: number;
  childId: number;
  day: string;
  roomScore: number;
  livingScore: number;
  points: number;
  settled: boolean;
  comment: string | null;
}

export interface HouseMonthResponse {
  month: string;
  days: HouseDayDto[];
  positiveRoomDays: number;
  positiveLivingDays: number;
  negativeDays: number;
  monthPoints: number;
  pendingPoints: number;
  currentStreak: number;
  nextStreakBonus: number;
  streakEnd: string | null;
}

export interface HouseCheckRequestDto {
  id: number;
  childId: number;
  childName: string;
  childAvatar: string;
  storeId: number;
  day: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt: string | null;
}

// ---------- RPG: навыки и инвентарь ----------

export type SkillId = 'MATH' | 'READING' | 'LOGIC' | 'LANG' | 'SPORT' | 'HOUSE';

export interface SkillProgressDto {
  skill: SkillId;
  name: string;
  icon: string;
  progress: number;
  xp: number;
  achievementXp: number;
  unlockedAchievements: number;
}

export type InventoryStatus = 'AVAILABLE' | 'ACTIVATION_PENDING' | 'ACTIVATED';

export interface InventoryItemDto {
  id: number;
  childId: number;
  childName: string;
  childAvatar: string;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  price: number;
  currencyName: string;
  currencyIcon: string;
  status: InventoryStatus;
  itemType: 'WARDROBE' | 'COUPON';
  createdAt: string;
  resolvedAt: string | null;
}

/**
 * Стопка неиспользованных покупок в «Инвентаре» (без статусов):
 * одинаковые товары сгруппированы по product_id, count — количество штук.
 */
export interface InventoryStackDto {
  productId: number;
  productName: string;
  storeId: number;
  storeName: string;
  price: number;
  currencyName: string;
  currencyIcon: string;
  count: number;
}

// ---------- «Дейлики»: квесты, уровень, депозиты, сезонные ивенты ----------

export interface LevelDto {
  xp: number;
  level: number;
  xpInLevel: number;
  xpToNext: number;
  ratio: number;
  rank: string;
  rankEmoji: string;
}

export type QuestType = 'DAILY' | 'STORY' | 'SEASONAL';

export interface QuestDto {
  id: number;
  parentId: number;
  childId: number | null;
  type: QuestType;
  title: string;
  description: string | null;
  basicDescription: string | null;
  acceptDescription: string | null;
  durationMinutes: number | null;
  cooldownHours: number;
  icon: string;
  rewardStoreId: number | null;
  rewardStoreName: string | null;
  currencyName: string | null;
  currencyIcon: string | null;
  rewardAmount: number;
  xpReward: number;
  seasonalEventId: number | null;
  repeatable: boolean;
  active: boolean;
  createdAt: string;
  /** Стадия квеста для ребёнка: AVAILABLE / ACTIVE / SUBMITTED / SLEEPING / DONE */
  childStatus: string | null;
  childStartsAt: string | null;
  childNextAvailableAt: string | null;
  /** Для родителя: сколько детей активировали / завершили квест */
  activeChildren: number;
  doneChildren: number;
}

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface QuestSubmissionDto {
  id: number;
  questId: number;
  questTitle: string;
  questIcon: string;
  questType: QuestType;
  childId: number;
  childName: string;
  childAvatar: string;
  status: SubmissionStatus;
  comment: string | null;
  photoUrl: string | null;
  rewardAmount: number;
  currencyName: string | null;
  currencyIcon: string | null;
  xpReward: number;
  seasonalEventId: number | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface SeasonalEventDto {
  id: number;
  name: string;
  description: string | null;
  tokenName: string;
  tokenIcon: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  openNow: boolean;
  createdAt: string;
}

export interface DepositDto {
  id: number;
  childId: number;
  storeId: number;
  storeName: string;
  currencyName: string;
  currencyIcon: string;
  amount: number;
  rate: number;
  lastInterestAt: string;
}

export interface AvatarItemDto {
  id: number;
  name: string;
  description: string | null;
  category: 'SKIN' | 'FRAME' | 'PET' | 'BACKGROUND';
  icon: string;
  createdAt: string;
}

export interface ChildAvatarItemDto {
  id: number;
  itemId: number;
  name: string;
  category: 'SKIN' | 'FRAME' | 'PET' | 'BACKGROUND';
  icon: string;
  equipped: boolean;
  unlockedAt: string;
}

export interface DailyTaskDto {
  index: number;
  type: string;
  question: string;
}

export interface LangWordDto {
  id: string;
  word: string;
  translation: string;
  learned: boolean;
}

export interface DailySkillDto {
  skill: string;
  name: string;
  icon: string;
  currencyName: string | null;
  currencyIcon: string | null;
  tasks: DailyTaskDto[];
  words: LangWordDto[];
  minutesLogged: number;
  stepsLogged: number;
  pointsEarned: number;
  pointsTarget: number;
  /** Выполненные задания дня (карточки: до 3; спорт/чтение/дом: 1). */
  tasksDone: number;
  tasksTotal: number;
  /** Из них зачтено положительно / отрицательно. */
  tasksOk: number;
  tasksFail: number;
  fullClear: boolean;
  completed: boolean;
}

export interface DailyStateDto {
  day: string;
  skills: DailySkillDto[];
}

export type NotificationType =
  | 'QUEST'
  | 'CARD_REVEAL'
  | 'CARD_HELP'
  | 'HOUSE_CHECK'
  | 'POCKET'
  | 'READING_DONE'
  | 'BOOK_REQUEST'
  | 'SPORT_REVIEW'
  | 'LIMIT_TV'
  | 'LIMIT_PC'
  | 'LIMIT_CONSOLE'
  | 'LIMIT_PHONE'
  | 'LIMIT_TABLET';

export interface NotificationDto {
  id: number;
  childId: number | null;
  childName: string | null;
  childAvatar: string | null;
  type: NotificationType;
  title: string;
  payload: string | null;
  refType: string | null;
  refId: number | null;
  status: 'NEW' | 'DONE';
  createdAt: string;
}

export interface SkillActivationDto {
  childId: number;
  childName: string;
  childAvatar: string;
  skill: string;
}

/** Карточка ребёнка в обзоре родителя (уровень, баллы, лимиты, квесты, дейлики, навыки). */
export interface OverviewChildDto {
  id: number;
  name: string;
  avatarEmoji: string;
  age: number | null;
  active: boolean;
  level: LevelDto;
  balances: BalanceRowDto[];
  limits: LimitStateDto;
  activeQuests: QuestDto[];
  dailies: DailySkillDto[];
  skills: SkillProgressDto[];
  activatedSkills: string[];
}

// ---------- Микросервис динамических математических карточек ----------

export type MathChoice =
  | 'EASY'    // Легкая
  | 'MEDIUM'  // Обычная
  | 'HIGH'    // Высокая
  | 'HARD'    // Сложная
  | 'EXTREME' // Хард
  | 'OLYMPIAD'; // Олимпиада

export type MathBaseDifficulty = 'EASY' | 'MEDIUM' | 'HIGH' | 'HARD';

export interface MathTopicDto {
  id: number;
  code: string;
  name: string;
  gradeLabel: string;
  active: boolean;
  baseDifficulty: MathBaseDifficulty;
}

export interface MathCardTaskDto {
  id: number;
  topicCode: string;
  taskType: string;
  text: string;
}

export type MathCardStatus =
  | 'CREATED'
  | 'REQUESTED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'FAILED';

export interface MathCardDto {
  id: number;
  date: string;
  level: string;
  levelLabel: string;
  levelEmoji: string;
  minutes: number;
  description: string;
  taskCount: number;
  taskTypes: string[];
  xpReward: number;
  maxMatrixReward: number;
  status: MathCardStatus;
  startedAt: string | null;
  deadline: string | null;
  resultPercent: number | null;
  xpEarned: number;
  tasks: MathCardTaskDto[];
}

export interface MathCardApprovalDto {
  cardId: number;
  childId: number;
  childName: string;
  childAvatar: string;
  level: string;
  levelLabel: string;
  levelEmoji: string;
  minutes: number;
  taskCount: number;
  xpReward: number;
}

export interface MathCardSubmitResult {
  percent: number;
  success: boolean;
  correct: number;
  total: number;
  perExampleXp: number;
  successReward: number;
  xpEarned: number;
}

export interface MathCardDayDto {
  cards: MathCardDto[];
  doneToday: number;
  dailyLimit: number;
}

// ===== Логические карточки (структурное зеркало математики) =====

export type LogicChoice =
  | 'EASY'      // Легкая
  | 'MEDIUM'    // Обычная
  | 'HIGH'      // Высокая
  | 'HARD'      // Сложная
  | 'EXTREME'   // Хард
  | 'OLYMPIAD'; // Олимпиада

export type LogicBaseDifficulty = 'EASY' | 'MEDIUM' | 'HIGH' | 'HARD';

export interface LogicTopicDto {
  id: number;
  code: string;
  name: string;
  gradeLabel: string;
  active: boolean;
  baseDifficulty: LogicBaseDifficulty;
}

export interface LogicCardTaskDto {
  id: number;
  topicCode: string;
  taskType: string;
  text: string;
}

export type LogicCardStatus =
  | 'CREATED'
  | 'REQUESTED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'FAILED';

export interface LogicCardDto {
  id: number;
  date: string;
  level: string;
  levelLabel: string;
  levelEmoji: string;
  minutes: number;
  description: string;
  taskCount: number;
  taskTypes: string[];
  xpReward: number;
  maxIqReward: number;
  status: LogicCardStatus;
  startedAt: string | null;
  deadline: string | null;
  resultPercent: number | null;
  xpEarned: number;
  tasks: LogicCardTaskDto[];
}

export interface LogicCardApprovalDto {
  cardId: number;
  childId: number;
  childName: string;
  childAvatar: string;
  level: string;
  levelLabel: string;
  levelEmoji: string;
  minutes: number;
  taskCount: number;
  xpReward: number;
}

export interface LogicCardSubmitResult {
  percent: number;
  success: boolean;
  correct: number;
  total: number;
  perTaskXp: number;
  successReward: number;
  xpEarned: number;
}

export interface LogicCardDayDto {
  cards: LogicCardDto[];
  doneToday: number;
  dailyLimit: number;
}

// ===== Карточки иностранного языка (6 видов заданий) =====

export type LangTaskType =
  | 'WORD_WALL'       // Стена слов (авто: en → ru)
  | 'SECRET_STORIES'  // Тайные истории (авто: пропуск en|ru)
  | 'DECODE'          // Расшифруй послание (ручное, множитель родителя)
  | 'SPELLING'        // А оно точно так пишется (авто: ru → en)
  | 'SHARE_SECRET'    // Поделись секретом (ручное)
  | 'MASTERY';        // Покажи своё мастерство (ручное)

export type LangDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface LangCardSettingDto {
  taskType: LangTaskType;
  label: string;
  emoji: string;
  manual: boolean;
  minutes: number;
  difficulty: LangDifficulty;
}

export interface LangCardTaskDto {
  id: number;
  taskType: LangTaskType;
  text: string;
}

export type LangCardStatus =
  | 'CREATED'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'SUCCESS'
  | 'FAILED';

export interface LangCardDto {
  id: number;
  date: string;
  taskType: LangTaskType;
  taskTypeLabel: string;
  taskTypeEmoji: string;
  manual: boolean;
  difficulty: LangDifficulty;
  difficultyLabel: string;
  minutes: number;
  baseReward: number;
  multiplier: number;
  maxReward: number;
  status: LangCardStatus;
  startedAt: string | null;
  deadline: string | null;
  submittedAt: string | null;
  resultPercent: number | null;
  xpEarned: number;
  parentComment: string | null;
  tasks: LangCardTaskDto[];
}

export interface LangCardDayDto {
  cards: LangCardDto[];
  doneToday: number;
  dailyLimit: number;
}

export interface LangCardSubmitResult {
  percent: number;
  success: boolean;
  correct: number;
  total: number;
  perTaskXp: number;
  successReward: number;
  xpEarned: number;
  sentToParent: boolean;
}

export interface LangVocabWord {
  wordId: number;
  foreign: string;
  ru: string;
  status: 'ACTIVE' | 'LEARNED';
  streak: number;
  streakTarget: number;
}

export interface LangParentVocabWord {
  wordId: number;
  foreign: string;
  ru: string;
  level: number;
  sortOrder: number;
  status: 'NONE' | 'ACTIVE' | 'LEARNED';
  streak: number;
  streakTarget: number;
}

export interface LangCardReviewDto {
  cardId: number;
  childId: number;
  childName: string;
  childAvatar: string;
  taskType: LangTaskType;
  taskTypeLabel: string;
  taskTypeEmoji: string;
  minutes: number;
  baseReward: number;
  taskTexts: string[];
  childAnswers: string[];
  submittedAt: string | null;
}

// ===== Спорт и хобби: направления, дейлик, запросы =====

export interface SportDirectionDto {
  id: number;
  name: string;
  icon: string;
  isToday: boolean;
}

export interface SportCardDto {
  id: number;
  directionId: number;
  directionName: string;
  directionIcon: string;
  status: 'CREATED' | 'REVIEW' | 'SUCCESS' | 'FAILED';
  baseReward: number;
  multiplier: number;
  maxReward: number;
  xpEarned: number;
  parentComment: string | null;
  submittedAt: string | null;
  taskTitles: string[];
  taskDescriptions: string[];
}

export interface SportDayDto {
  directions: SportDirectionDto[];
  card: SportCardDto | null;
}

export interface SportRequestDto {
  requestId: number;
  childId: number;
  childName: string;
  childAvatar: string;
  name: string;
  comment: string | null;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

export interface SportTaskDto {
  id: number;
  directionId: number;
  title: string;
  description: string;
  gradeMin: number;
  gradeMax: number;
  sortOrder: number;
}

export interface SportDirectionFullDto {
  id: number;
  childId: number;
  name: string;
  icon: string;
  status: string;
  taskCount: number;
}

export interface SportCardReviewDto {
  cardId: number;
  childId: number;
  childName: string;
  childAvatar: string;
  directionName: string;
  directionIcon: string;
  baseReward: number;
  taskTitles: string[];
  submittedAt: string | null;
}

export interface SportDirectionFullDto {
  id: number;
  childId: number;
  name: string;
  icon: string;
  status: string;
  taskCount: number;
}
// ============================================================
// Подземелья (данжи) и RPG-механики персонажа
// ============================================================

export type DungeonCharacterStatus = 'LOCKED' | 'FREE' | 'IN_DUNGEON' | 'RESTING';
export type DungeonSessionStatus = 'ACTIVE' | 'RESTING' | 'WON' | 'LOST';

export interface DungeonLogEntryDto {
  at: string;
  icon: string;
  text: string;
}

export type DungeonQuestRank = 'F' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface DungeonCharacterDto {
  characterClass: 'WARRIOR' | 'MAGE' | 'ARCHER' | null;
  status: DungeonCharacterStatus;
  stamina: number;
  maxStamina: number;
  victories: number;
  /** Рекорд игрока: максимальный зачищенный ранг данжа. */
  maxClearedRank: DungeonQuestRank | 'NONE';
}

/** Таверна открывается при ранге «Железо» по навыку «Чтение». */
export interface DungeonUnlockDto {
  unlocked: boolean;
  readingRank: string;
}

export interface DungeonSessionDto {
  id: number;
  dungeonCode: string;
  rank: DungeonQuestRank;
  monsterLevel: number;
  dungeonName: string;
  dungeonEmoji: string;
  status: DungeonSessionStatus;
  currentRoom: number;
  roomsTotal: number;
  rewardCoins: number;
  logs: DungeonLogEntryDto[];
}

export interface DungeonEquipmentDto {
  id: number;
  code: string;
  name: string;
  slot: string;
  rarity: string;
  statMultiplier: number;
  icon: string;
  description: string;
  identified: boolean;
  equipped: boolean;
}

export interface DungeonStateDto {
  character: DungeonCharacterDto;
  unlock: DungeonUnlockDto;
  session: DungeonSessionDto | null;
  equipment: DungeonEquipmentDto[];
}

/** Шаг 1 регистрации: аккаунт создан, ждём код из письма (или сразу токен в dev-режиме). */
export interface RegisterResponse {
  email: string;
  needsVerification: boolean;
  token: string | null;
  user: { id: number; email: string; name: string } | null;
}
