package com.familymarket.achievement;

import com.familymarket.balance.BalanceService;
import com.familymarket.balance.BalanceRepository;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.daily.DailyLogRepository;
import com.familymarket.dto.AchievementDto;
import com.familymarket.dto.AchievementUpsertRequest;
import com.familymarket.dto.ChildAchievementGroupDto;
import com.familymarket.dto.GrantAchievementRequest;
import com.familymarket.dto.GrantResult;
import com.familymarket.dto.SkillTotalDto;
import com.familymarket.house.HouseDayRepository;
import com.familymarket.math.MathAttemptRepository;
import com.familymarket.purchase.PurchaseRepository;
import com.familymarket.reading.ReadingBook;
import com.familymarket.reading.ReadingBookCatalog;
import com.familymarket.reading.ReadingLogRepository;
import com.familymarket.store.Store;
import com.familymarket.taskcard.ChildTaskCardRepository;
import com.familymarket.store.StoreRepository;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AchievementService {

    /** Ключевые слова для определения жанра книги (регистронезависимо). */
    private static final Map<String, List<String>> GENRE_KEYWORDS = Map.ofEntries(
            Map.entry("READING_GENRE_FANTASY", List.of("фэнтези", "fantasy")),
            Map.entry("READING_GENRE_SCIFI", List.of("фантастик", "фантасти", "sci-fi", "sci fi", "scifi", "science fiction")),
            Map.entry("READING_GENRE_DETECTIVE", List.of("детектив")),
            Map.entry("READING_GENRE_ADVENTURE", List.of("приключ")),
            Map.entry("READING_GENRE_CONTEMPORARY", List.of("современн", "проза", "драма", "жизнь")),
            Map.entry("READING_GENRE_HISTORY", List.of("историч", "историческ", "history")),
            Map.entry("READING_GENRE_HORROR", List.of("ужас", "мистик", "horror", "хоррор")),
            Map.entry("READING_GENRE_SCIENCE", List.of("научпоп", "научно-поп", "энцикл", "познават", "non-fiction", "nonfiction")),
            Map.entry("READING_GENRE_FAIRYTALE", List.of("сказк", "миф", "легенд", "басн")),
            Map.entry("READING_GENRE_POETRY", List.of("поэзи", "стих", "поэм")),
            Map.entry("READING_GENRE_COMICS", List.of("комикс", "манга", "manga")),
            Map.entry("READING_GENRE_HUMOR", List.of("юмор", "комеди", "comedy", "смешн")));

    private final AchievementRepository achievementRepository;
    private final ChildRepository childRepository;
    private final StoreRepository storeRepository;
    private final ChildAchievementRepository childAchievementRepository;
    private final ChildTrackedAchievementRepository trackedRepository;
    private final BalanceRepository balanceRepository;
    private final UserRepository userRepository;
    private final ReadingLogRepository readingLogRepository;
    private final MathAttemptRepository mathAttemptRepository;
    private final HouseDayRepository houseDayRepository;
    private final PurchaseRepository purchaseRepository;
    private final DailyLogRepository dailyLogRepository;
    private final ChildTaskCardRepository childTaskCardRepository;
    private final BalanceService balanceService;

    public AchievementService(AchievementRepository achievementRepository,
                              ChildRepository childRepository,
                              StoreRepository storeRepository,
                              ChildAchievementRepository childAchievementRepository,
                              ChildTrackedAchievementRepository trackedRepository,
                              BalanceRepository balanceRepository,
                              UserRepository userRepository,
                              ReadingLogRepository readingLogRepository,
                              MathAttemptRepository mathAttemptRepository,
                              HouseDayRepository houseDayRepository,
                              PurchaseRepository purchaseRepository,
                              DailyLogRepository dailyLogRepository,
                              ChildTaskCardRepository childTaskCardRepository,
                              BalanceService balanceService) {
        this.achievementRepository = achievementRepository;
        this.childRepository = childRepository;
        this.storeRepository = storeRepository;
        this.childAchievementRepository = childAchievementRepository;
        this.trackedRepository = trackedRepository;
        this.balanceRepository = balanceRepository;
        this.userRepository = userRepository;
        this.readingLogRepository = readingLogRepository;
        this.mathAttemptRepository = mathAttemptRepository;
        this.houseDayRepository = houseDayRepository;
        this.purchaseRepository = purchaseRepository;
        this.dailyLogRepository = dailyLogRepository;
        this.childTaskCardRepository = childTaskCardRepository;
        this.balanceService = balanceService;
    }

    @Transactional
    public List<AchievementDto> list(Long parentId) {
        ensureDefaultAchievements(parentId);
        return achievementRepository.findByParentIdOrderByCreatedAtDesc(parentId)
                .stream().map(AchievementDto::from).toList();
    }

    /**
     * Автогенерация стартовых комплектов достижений чтения и математики
     * (вызывается при первом обращении родителя/ребёнка, пока их нет).
     */
    @Transactional
    public void ensureDefaultAchievements(Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        if (achievementRepository.countByParentIdAndSkill(parentId, "READING") == 0) {
            achievementRepository.saveAll(AchievementDefaults.reading(parent));
        }
        if (achievementRepository.countByParentIdAndSkill(parentId, "MATH") == 0) {
            achievementRepository.saveAll(AchievementDefaults.math(parent));
        }
        if (achievementRepository.countByParentIdAndSkill(parentId, "HOUSE") == 0) {
            achievementRepository.saveAll(AchievementDefaults.house(parent));
        }
    }

    @Transactional
    public Achievement create(Long parentId, AchievementUpsertRequest request) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        Achievement achievement = new Achievement();
        achievement.setParent(parent);
        achievement.setName(request.name().trim());
        achievement.setDescription(request.description());
        achievement.setIcon(defaultIcon(request.icon()));
        achievement.setRewardAmount(request.rewardAmount() == null ? BigDecimal.ZERO : request.rewardAmount());
        achievement.setTargetType(normalizeTargetType(request.targetType()));
        achievement.setTargetValue(request.targetValue() == null ? 0 : request.targetValue());
        achievement.setGroupKey(trimToNull(request.groupKey()));
        achievement.setSkill(normalizeSkill(request.skill()));
        achievement.setLevel(request.level() == null ? 0 : request.level());
        achievement.setHiddenReward(Boolean.TRUE.equals(request.hiddenReward()));
        achievement.setXpReward(request.xpReward() == null ? 0 : request.xpReward());
        achievement.setTitle(trimToNull(request.title()));
        if (request.rewardStoreId() != null) {
            achievement.setRewardStore(storeRepository.findById(request.rewardStoreId())
                    .orElseThrow(() -> new NotFoundException("Магазин не найден")));
        }
        achievement.setCreatedAt(Instant.now());
        return achievementRepository.save(achievement);
    }

    @Transactional
    public Achievement update(Long parentId, Long id, AchievementUpsertRequest request) {
        Achievement achievement = getOwned(parentId, id);
        // Дефолтные достижения меняются только в части награды
        if (isDefault(achievement)) {
            if (request.rewardAmount() != null) {
                achievement.setRewardAmount(request.rewardAmount());
            }
            achievement.setRewardStore(request.rewardStoreId() == null ? null
                    : storeRepository.findById(request.rewardStoreId())
                    .orElseThrow(() -> new NotFoundException("Магазин не найден")));
            if (request.xpReward() != null) {
                achievement.setXpReward(request.xpReward());
            }
            if (request.hiddenReward() != null) {
                achievement.setHiddenReward(request.hiddenReward());
            }
            return achievementRepository.save(achievement);
        }
        achievement.setName(request.name().trim());
        achievement.setDescription(request.description());
        if (request.icon() != null && !request.icon().isBlank()) {
            achievement.setIcon(request.icon().trim());
        }
        if (request.rewardAmount() != null) {
            achievement.setRewardAmount(request.rewardAmount());
        }
        if (request.targetType() != null) {
            achievement.setTargetType(normalizeTargetType(request.targetType()));
        }
        if (request.targetValue() != null) {
            achievement.setTargetValue(request.targetValue());
        }
        if (request.groupKey() != null) {
            achievement.setGroupKey(trimToNull(request.groupKey()));
        }
        if (request.skill() != null) {
            achievement.setSkill(normalizeSkill(request.skill()));
        }
        if (request.level() != null) {
            achievement.setLevel(request.level());
        }
        if (request.hiddenReward() != null) {
            achievement.setHiddenReward(request.hiddenReward());
        }
        if (request.rewardStoreId() != null) {
            achievement.setRewardStore(storeRepository.findById(request.rewardStoreId())
                    .orElseThrow(() -> new NotFoundException("Магазин не найден")));
        } else if (request.rewardStoreId() != null || request.rewardStoreId() == null && request.targetType() != null) {
            // rewardStoreId == null оставляем как есть
        }
        if (request.xpReward() != null) {
            achievement.setXpReward(request.xpReward());
        }
        if (request.title() != null) {
            achievement.setTitle(trimToNull(request.title()));
        }
        return achievementRepository.save(achievement);
    }

    @Transactional
    public void delete(Long parentId, Long id) {
        Achievement achievement = getOwned(parentId, id);
        if (isDefault(achievement)) {
            throw new BadRequestException("Дефолтное достижение нельзя удалить — можно только изменить награду");
        }
        achievementRepository.delete(achievement);
    }

    /**
     * Добавить следующий уровень к достижению (кнопка «+» у родителя):
     * одиночное достижение становится группой (генерируется group_key),
     * у группы — следующий уровень. Имя уровня — метрика (Бронза/Серебро/Золото/…).
     */
    @Transactional
    public Achievement addLevel(Long parentId, Long achievementId) {
        Achievement base = getOwned(parentId, achievementId);
        if (isDefault(base)) {
            throw new BadRequestException("Добавлять уровни дефолтным достижениям нельзя");
        }
        final String groupKey = base.getGroupKey() != null
                ? base.getGroupKey()
                : "g-" + base.getId() + "-" + System.currentTimeMillis();
        int maxLevel = achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId).stream()
                .filter(a -> groupKey.equals(a.getGroupKey()))
                .mapToInt(Achievement::getLevel)
                .max().orElse(0);

        Achievement next = new Achievement();
        next.setParent(base.getParent());
        next.setName(base.getName());
        next.setDescription(base.getDescription());
        next.setIcon(base.getIcon());
        next.setRewardAmount(base.getRewardAmount());
        next.setTargetType(base.getTargetType());
        next.setTargetValue(base.getTargetValue());
        next.setGroupKey(groupKey);
        next.setSkill(base.getSkill());
        next.setLevel(maxLevel + 1);
        next.setHiddenReward(base.isHiddenReward());
        next.setXpReward(base.getXpReward());
        next.setTitle(base.getTitle());
        next.setRewardStore(base.getRewardStore());
        next.setCreatedAt(Instant.now());
        return achievementRepository.save(next);
    }

    /**
     * Ручная выдача достижения ребенку (для целей без автоначисления).
     */
    @Transactional
    public GrantResult grant(Long parentId, GrantAchievementRequest request) {
        Achievement achievement = getOwned(parentId, request.achievementId());
        Child child = childRepository.findByIdAndParentId(request.childId(), parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (childAchievementRepository.findByChildIdAndAchievementId(child.getId(), achievement.getId()).isPresent()) {
            return new GrantResult(achievement.getId(), child.getId(), BigDecimal.ZERO, null);
        }
        ChildAchievement childAchievement = new ChildAchievement();
        childAchievement.setChild(child);
        childAchievement.setAchievement(achievement);
        childAchievement.setUnlockedAt(Instant.now());
        childAchievementRepository.save(childAchievement);

        BigDecimal credited = BigDecimal.ZERO;
        Long storeId = null;
        if (achievement.getRewardStore() != null && achievement.getRewardAmount().signum() > 0) {
            balanceService.credit(child.getId(), achievement.getRewardStore().getId(), achievement.getRewardAmount());
            credited = achievement.getRewardAmount();
            storeId = achievement.getRewardStore().getId();
        }
        return new GrantResult(achievement.getId(), child.getId(), credited, storeId);
    }

    /**
     * Автоначисление: если цель достигнута — достижение выдаётся и награда начисляется сама.
     * Вызывается после действий ребёнка (чтение, задачи, дом, покупки) и при просмотре профиля.
     */
    @Transactional
    public void checkProgress(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ensureDefaultAchievements(parentId);
        List<Achievement> achievements = achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        for (List<Achievement> group : groupByLevel(achievements)) {
            // Серийные книжные квесты: авто-выдача, когда прочитаны ВСЕ книги чек-листа
            String groupKey = group.get(0).getGroupKey();
            if (groupKey != null && groupKey.startsWith("READING_QUEST_")) {
                List<ReadingBookCatalog.CatalogBook> questBooks = ReadingBookCatalog.byQuest(groupKey);
                boolean allRead = !questBooks.isEmpty() && questBooks.stream()
                        .allMatch(b -> readingLogRepository.countApprovedByName(childId, b.name()) > 0);
                if (allRead) {
                    for (Achievement achievement : group) {
                        if (childAchievementRepository.findByChildIdAndAchievementId(childId, achievement.getId()).isEmpty()) {
                            unlockAchievement(childId, achievement);
                        }
                    }
                }
                continue;
            }
            for (Achievement achievement : group) {
                if (achievement.getTargetValue() <= 0) {
                    break; // без цели уровни не автоначисляются
                }
                long progress = progressFor(achievement, childId);
                if (progress < achievement.getTargetValue()) {
                    break; // следующий уровень недостижим, пока не достигнут текущий
                }
                if (childAchievementRepository.findByChildIdAndAchievementId(childId, achievement.getId()).isEmpty()) {
                    unlockAchievement(childId, achievement);
                }
            }
        }
    }

    private void unlockAchievement(Long childId, Achievement achievement) {
        ChildAchievement childAchievement = new ChildAchievement();
        childAchievement.setChild(childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
        childAchievement.setAchievement(achievement);
        childAchievement.setUnlockedAt(Instant.now());
        childAchievementRepository.save(childAchievement);

        if (achievement.getRewardStore() != null && achievement.getRewardAmount().signum() > 0) {
            balanceService.credit(childId, achievement.getRewardStore().getId(), achievement.getRewardAmount());
        }
    }

    /** Дефолтное (системное) достижение — нельзя удалять и менять параметры, только награду. */
    private boolean isDefault(Achievement achievement) {
        return List.of("READING", "MATH", "HOUSE").contains(achievement.getSkill()) && achievement.getGroupKey() != null;
    }

    /** Сколько ступеней достижений есть и получено по каждому навыку (полоска прогресса). */
    @Transactional
    public List<SkillTotalDto> totals(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ensureDefaultAchievements(parentId);
        List<Achievement> achievements = achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        Map<String, List<Achievement>> bySkill = new LinkedHashMap<>();
        for (Achievement achievement : achievements) {
            String key = achievement.getSkill() == null ? "NONE" : achievement.getSkill();
            bySkill.computeIfAbsent(key, k -> new ArrayList<>()).add(achievement);
        }
        List<SkillTotalDto> result = new ArrayList<>();
        for (Map.Entry<String, List<Achievement>> entry : bySkill.entrySet()) {
            List<Long> ids = entry.getValue().stream().map(Achievement::getId).toList();
            result.add(new SkillTotalDto(entry.getKey(), ids.size(),
                    childAchievementRepository.countByChildIdAndAchievementIdIn(childId, ids)));
        }
        return result;
    }

    /** Достижения (статусы ребёнка) для просмотра родителем. */
    @Transactional
    public List<ChildAchievementGroupDto> childAchievementsForParent(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return childAchievements(childId);
    }

    /**
     * Все достижения родителя для ребёнка, сгруппированные по уровням.
     * Ребёнок видит только ближайший уровень; скрытая награда скрыта до достижения.
     */
    @Transactional
    public List<ChildAchievementGroupDto> childAchievements(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ensureDefaultAchievements(parentId);
        List<Achievement> achievements = achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        List<ChildAchievementGroupDto> result = new ArrayList<>();
        for (List<Achievement> group : groupByLevel(achievements)) {
            Achievement first = group.get(0);
            Achievement current = null;
            // Чек-лист серийного книжного квеста (книги из каталога достижений)
            List<String> questBooks = null;
            List<Boolean> questRead = null;
            String groupKey = first.getGroupKey();
            if (groupKey != null && groupKey.startsWith("READING_QUEST_")) {
                List<ReadingBookCatalog.CatalogBook> quest = ReadingBookCatalog.byQuest(groupKey);
                questBooks = quest.stream().map(ReadingBookCatalog.CatalogBook::name).toList();
                questRead = quest.stream()
                        .map(b -> readingLogRepository.countApprovedByName(childId, b.name()) > 0)
                        .toList();
            }
            boolean completed = true;
            for (Achievement achievement : group) {
                long progress = progressFor(achievement, childId);
                boolean unlocked = childAchievementRepository
                        .findByChildIdAndAchievementId(childId, achievement.getId()).isPresent();
                if (achievement.getTargetValue() > 0 && progress < achievement.getTargetValue()) {
                    current = achievement;
                    completed = false;
                    break;
                }
                if (!unlocked) {
                    // цель достигнута, но автоначисление ещё не сработало — показываем как актуальный
                    current = achievement;
                    completed = false;
                    break;
                }
            }
            if (current == null) {
                current = group.get(group.size() - 1);
            }
            boolean unlocked = childAchievementRepository
                    .findByChildIdAndAchievementId(childId, current.getId()).isPresent();
            BigDecimal reward = current.isHiddenReward() && !unlocked
                    ? null
                    : current.getRewardAmount();
            result.add(new ChildAchievementGroupDto(
                    first.getId(),
                    first.getGroupKey(),
                    first.getName(),
                    current.getXpReward(),
                    first.getDescription(),
                    first.getIcon(),
                    current.getTargetType(),
                    current.getTargetValue(),
                    progressFor(current, childId),
                    tierName(current.getLevel()),
                    current.getSkill(),
                    current.getLevel(),
                    reward,
                    current.isHiddenReward(),
                    unlocked,
                    completed,
                    questBooks,
                    questRead));
        }
        return result;
    }

    // ---------- Отслеживаемые достижения (главная ребёнка) ----------

    @Transactional(readOnly = true)
    public List<Long> trackedIds(Long childId) {
        return trackedRepository.findByChildId(childId).stream()
                .map(t -> t.getAchievement().getId())
                .toList();
    }

    /** Переключить отслеживание достижения. */
    @Transactional
    public boolean track(Long childId, Long achievementId) {
        return trackedRepository.findByChildIdAndAchievementId(childId, achievementId)
                .map(existing -> {
                    trackedRepository.delete(existing);
                    return false;
                })
                .orElseGet(() -> {
                    ChildTrackedAchievement tracked = new ChildTrackedAchievement();
                    tracked.setChild(childRepository.findById(childId)
                            .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
                    tracked.setAchievement(getOwned(childRepository.findParentIdById(childId)
                            .orElseThrow(() -> new NotFoundException("Ребенок не найден")), achievementId));
                    tracked.setCreatedAt(Instant.now());
                    trackedRepository.save(tracked);
                    return true;
                });
    }

    private List<List<Achievement>> groupByLevel(List<Achievement> achievements) {
        Map<String, List<Achievement>> byKey = new LinkedHashMap<>();
        for (Achievement achievement : achievements) {
            String key = achievement.getGroupKey() == null
                    ? "single-" + achievement.getId()
                    : achievement.getGroupKey();
            byKey.computeIfAbsent(key, k -> new ArrayList<>()).add(achievement);
        }
        List<List<Achievement>> groups = new ArrayList<>(byKey.values());
        for (List<Achievement> group : groups) {
            group.sort(Comparator.comparingInt(Achievement::getLevel));
        }
        return groups;
    }

    public long progressFor(Achievement achievement, Long childId) {
        return switch (achievement.getTargetType()) {
            case "READING_BOOKS" -> readingLogRepository.countApprovedByChildId(childId);
            case "READING_PAGES" -> readingLogRepository.sumPagesByChildId(childId);
            case "READING_GENRES" -> bookGenreCodes(childId).size();
            case "READING_SERIES" -> bookSeries(childId).size();
            case "READING_HEAVY_BOOKS" -> readingLogRepository.findApprovedBooksByChildId(childId).stream()
                    .filter(b -> b.getPages() >= 600).count();
            case "READING_GENRE_FANTASY", "READING_GENRE_SCIFI", "READING_GENRE_DETECTIVE",
                    "READING_GENRE_ADVENTURE", "READING_GENRE_CONTEMPORARY", "READING_GENRE_HISTORY",
                    "READING_GENRE_HORROR", "READING_GENRE_SCIENCE", "READING_GENRE_FAIRYTALE",
                    "READING_GENRE_POETRY", "READING_GENRE_COMICS", "READING_GENRE_HUMOR" ->
                    readingLogRepository.findApprovedBooksByChildId(childId).stream()
                            .filter(b -> achievement.getTargetType().equals(genreCodeOf(b))).count();
            case "MATH_TASKS" -> mathAttemptRepository.countCorrectByChildId(childId);
            case "MATH_CARDS" -> childTaskCardRepository.countDoneMathByChildId(childId);
            case "HOUSE_ROOM_POINTS" -> houseDayRepository.sumRoomScoreByChildId(childId);
            case "HOUSE_HELP_POINTS" -> houseDayRepository.sumLivingScoreByChildId(childId);
            case "POINTS_EARNED" -> balanceRepository.sumByChildId(childId).longValue();
            case "MATH_STREAK" -> streak(mathAttemptRepository.findDistinctCorrectDates(childId));
            case "HOUSE_CLEAN_STREAK" -> streak(houseDayRepository.findCleanRoomDays(childId));
            case "HOUSE_HELP_STREAK" -> streak(houseDayRepository.findHelpDays(childId));
            case "HOME_PURCHASES" -> purchaseRepository.countPaidInHomeStores(childId);
            case "LOGIC_TASKS" -> dailyLogRepository.sumPointsByChildIdAndSkill(childId, "LOGIC");
            case "LANG_WORDS" -> dailyLogRepository.sumPointsByChildIdAndSkill(childId, "LANG");
            case "SPORT_DAYS" -> dailyLogRepository.findActiveDays(childId, "SPORT").size();
            case "READING_STREAK" -> streak(readingLogRepository.findDistinctApprovedDates(childId));
            case "LOGIC_STREAK" -> streak(dailyLogRepository.findActiveDays(childId, "LOGIC"));
            case "LANG_STREAK" -> streak(dailyLogRepository.findActiveDays(childId, "LANG"));
            case "SPORT_STREAK" -> streak(dailyLogRepository.findActiveDays(childId, "SPORT"));
            default -> 0;
        };
    }

    private long streak(List<LocalDate> dates) {
        if (dates.isEmpty()) {
            return 0;
        }
        Set<LocalDate> set = new HashSet<>(dates);
        LocalDate cursor = LocalDate.now();
        if (!set.contains(cursor)) {
            cursor = cursor.minusDays(1);
        }
        long count = 0;
        while (set.contains(cursor)) {
            count++;
            cursor = cursor.minusDays(1);
        }
        return count;
    }

    private Achievement getOwned(Long parentId, Long id) {
        return achievementRepository.findByIdAndParentId(id, parentId)
                .orElseThrow(() -> new NotFoundException("Достижение не найдено"));
    }

    /**
     * Ранг уровня достижения. Ровно 11 ступеней, как в ранговой системе персонажа:
     * Дерево → Железо → Бронза → Серебро → Золото → Платина → Изумруд →
     * Алмаз → Мастер → Гранд-мастер → Чемпион. Уровень 0 — одиночное.
     */
    private String tierName(int level) {
        return switch (level) {
            case 0 -> "Одиночное";
            case 1 -> "Дерево";
            case 2 -> "Железо";
            case 3 -> "Бронза";
            case 4 -> "Серебро";
            case 5 -> "Золото";
            case 6 -> "Платина";
            case 7 -> "Изумруд";
            case 8 -> "Алмаз";
            case 9 -> "Мастер";
            case 10 -> "Гранд-мастер";
            default -> "Чемпион";
        };
    }

    private String defaultIcon(String icon) {
        return icon == null || icon.isBlank() ? "🏆" : icon.trim();
    }

    private String normalizeTargetType(String targetType) {
        if (targetType == null || targetType.isBlank()) {
            return "NONE";
        }
        String normalized = targetType.trim().toUpperCase();
        return switch (normalized) {
            case "READING_BOOKS", "READING_PAGES", "READING_GENRES", "READING_SERIES",
                    "READING_HEAVY_BOOKS", "READING_GENRE_FANTASY", "READING_GENRE_SCIFI",
                    "READING_GENRE_DETECTIVE", "READING_GENRE_ADVENTURE", "READING_GENRE_CONTEMPORARY",
                    "READING_GENRE_HISTORY", "READING_GENRE_HORROR", "READING_GENRE_SCIENCE",
                    "READING_GENRE_FAIRYTALE", "READING_GENRE_POETRY", "READING_GENRE_COMICS",
                    "READING_GENRE_HUMOR",
                    "MATH_TASKS", "MATH_CARDS", "HOUSE_ROOM_POINTS", "HOUSE_HELP_POINTS", "POINTS_EARNED",
                    "MATH_STREAK", "HOUSE_CLEAN_STREAK", "HOUSE_HELP_STREAK", "HOME_PURCHASES",
                    "LOGIC_TASKS", "LANG_WORDS", "SPORT_DAYS",
                    "READING_STREAK", "LOGIC_STREAK", "LANG_STREAK", "SPORT_STREAK" -> normalized;
            default -> "NONE";
        };
    }

    // ---------- Чтение: жанры и серии ----------

    /** Коды жанров книг, которые ребёнок уже прочитал (без повторов). */
    private Set<String> bookGenreCodes(Long childId) {
        Set<String> codes = new LinkedHashSet<>();
        for (ReadingBook book : readingLogRepository.findApprovedBooksByChildId(childId)) {
            String code = genreCodeOf(book);
            if (code != null) {
                codes.add(code);
            }
        }
        return codes;
    }

    /** Уникальные серии прочитанных книг (без пустых). */
    private Set<String> bookSeries(Long childId) {
        Set<String> series = new LinkedHashSet<>();
        for (ReadingBook book : readingLogRepository.findApprovedBooksByChildId(childId)) {
            if (book.getSeries() != null && !book.getSeries().isBlank()) {
                series.add(book.getSeries().trim().toLowerCase());
            }
        }
        return series;
    }

    /** Код жанра книги по ключевым словам или null, если жанр не распознан. */
    private String genreCodeOf(ReadingBook book) {
        return genreCodeOf(book.getGenre());
    }

    private String genreCodeOf(String rawGenre) {
        if (rawGenre == null || rawGenre.isBlank()) {
            return null;
        }
        String genre = rawGenre.toLowerCase();
        for (Map.Entry<String, List<String>> entry : GENRE_KEYWORDS.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (genre.contains(keyword)) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeSkill(String skill) {
        if (skill == null || skill.isBlank()) {
            return null;
        }
        String normalized = skill.trim().toUpperCase();
        return switch (normalized) {
            case "MATH", "READING", "LOGIC", "LANG", "SPORT", "HOUSE" -> normalized;
            default -> null;
        };
    }
}