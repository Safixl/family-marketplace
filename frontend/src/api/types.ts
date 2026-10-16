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
  age: number | null;
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
  name: string;
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
}

export interface ChildReadingResponse {
  books: ChildBookDto[];
  requests: ReadingRequestDto[];
  stats: ReadingStatsDto;
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
}

export interface HouseMonthResponse {
  month: string;
  days: HouseDayDto[];
  positiveRoomDays: number;
  positiveLivingDays: number;
  negativeDays: number;
  monthPoints: number;
  pendingPoints: number;
}

// ---------- RPG: навыки и инвентарь ----------

export type SkillId = 'MATH' | 'READING' | 'LOGIC' | 'LANG' | 'SPORT' | 'HOUSE';

export interface SkillProgressDto {
  skill: SkillId;
  name: string;
  icon: string;
  progress: number;
  xp: number;
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
  fullClear: boolean;
  completed: boolean;
}

export interface DailyStateDto {
  day: string;
  skills: DailySkillDto[];
}