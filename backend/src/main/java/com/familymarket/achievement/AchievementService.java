package com.familymarket.achievement;

import com.familymarket.balance.BalanceService;
import com.familymarket.balance.BalanceRepository;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.AchievementDto;
import com.familymarket.dto.AchievementUpsertRequest;
import com.familymarket.dto.ChildAchievementGroupDto;
import com.familymarket.dto.GrantAchievementRequest;
import com.familymarket.dto.GrantResult;
import com.familymarket.house.HouseDayRepository;
import com.familymarket.math.MathAttemptRepository;
import com.familymarket.purchase.PurchaseRepository;
import com.familymarket.reading.ReadingLogRepository;
import com.familymarket.store.Store;
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
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final ChildRepository childRepository;
    private final StoreRepository storeRepository;
    private final ChildAchievementRepository childAchievementRepository;
    private final BalanceRepository balanceRepository;
    private final UserRepository userRepository;
    private final ReadingLogRepository readingLogRepository;
    private final MathAttemptRepository mathAttemptRepository;
    private final HouseDayRepository houseDayRepository;
    private final PurchaseRepository purchaseRepository;
    private final BalanceService balanceService;

    public AchievementService(AchievementRepository achievementRepository,
                              ChildRepository childRepository,
                              StoreRepository storeRepository,
                              ChildAchievementRepository childAchievementRepository,
                              BalanceRepository balanceRepository,
                              UserRepository userRepository,
                              ReadingLogRepository readingLogRepository,
                              MathAttemptRepository mathAttemptRepository,
                              HouseDayRepository houseDayRepository,
                              PurchaseRepository purchaseRepository,
                              BalanceService balanceService) {
        this.achievementRepository = achievementRepository;
        this.childRepository = childRepository;
        this.storeRepository = storeRepository;
        this.childAchievementRepository = childAchievementRepository;
        this.balanceRepository = balanceRepository;
        this.userRepository = userRepository;
        this.readingLogRepository = readingLogRepository;
        this.mathAttemptRepository = mathAttemptRepository;
        this.houseDayRepository = houseDayRepository;
        this.purchaseRepository = purchaseRepository;
        this.balanceService = balanceService;
    }

    public List<AchievementDto> list(Long parentId) {
        return achievementRepository.findByParentIdOrderByCreatedAtDesc(parentId)
                .stream().map(AchievementDto::from).toList();
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
        return achievementRepository.save(achievement);
    }

    @Transactional
    public void delete(Long parentId, Long id) {
        achievementRepository.delete(getOwned(parentId, id));
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
        List<Achievement> achievements = achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        for (List<Achievement> group : groupByLevel(achievements)) {
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

    /**
     * Все достижения родителя для ребёнка, сгруппированные по уровням.
     * Ребёнок видит только ближайший уровень; скрытая награда скрыта до достижения.
     */
    @Transactional(readOnly = true)
    public List<ChildAchievementGroupDto> childAchievements(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        List<Achievement> achievements = achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        List<ChildAchievementGroupDto> result = new ArrayList<>();
        for (List<Achievement> group : groupByLevel(achievements)) {
            Achievement first = group.get(0);
            Achievement current = null;
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
                    first.getName(),
                    first.getDescription(),
                    first.getIcon(),
                    current.getTargetType(),
                    current.getTargetValue(),
                    progressFor(current, childId),
                    current.getName(),
                    current.getSkill(),
                    current.getLevel(),
                    reward,
                    current.isHiddenReward(),
                    unlocked,
                    completed));
        }
        return result;
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
            case "MATH_TASKS" -> mathAttemptRepository.countCorrectByChildId(childId);
            case "POINTS_EARNED" -> balanceRepository.sumByChildId(childId).longValue();
            case "MATH_STREAK" -> streak(mathAttemptRepository.findDistinctCorrectDates(childId));
            case "HOUSE_CLEAN_STREAK" -> streak(houseDayRepository.findCleanRoomDays(childId));
            case "HOUSE_HELP_STREAK" -> streak(houseDayRepository.findHelpDays(childId));
            case "HOME_PURCHASES" -> purchaseRepository.countPaidInHomeStores(childId);
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

    private String defaultIcon(String icon) {
        return icon == null || icon.isBlank() ? "🏆" : icon.trim();
    }

    private String normalizeTargetType(String targetType) {
        if (targetType == null || targetType.isBlank()) {
            return "NONE";
        }
        String normalized = targetType.trim().toUpperCase();
        return switch (normalized) {
            case "READING_BOOKS", "READING_PAGES", "MATH_TASKS", "POINTS_EARNED",
                    "MATH_STREAK", "HOUSE_CLEAN_STREAK", "HOUSE_HELP_STREAK", "HOME_PURCHASES" -> normalized;
            default -> "NONE";
        };
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