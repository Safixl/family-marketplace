package com.familymarket.taskcard;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.daily.DailyService;
import com.familymarket.dto.TaskCardDto;
import com.familymarket.dto.TaskCardSubmitRequest;
import com.familymarket.dto.TaskCardUpsertRequest;
import com.familymarket.dto.TaskItem;
import com.familymarket.house.HouseDay;
import com.familymarket.house.HouseDayRepository;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TaskCardService {

    private static final int MAX_HOUSE_BONUS_PER_DAY = 6;
    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    /** День карточки: начинается в 09:00 МСК (до 09:00 действует вчерашний день). */
    private LocalDate limitDay(Instant now) {
        ZonedDateTime msk = now.atZone(ZONE);
        ZonedDateTime dayStart = msk.toLocalDate().atTime(9, 0).atZone(ZONE);
        return msk.isBefore(dayStart) ? msk.toLocalDate().minusDays(1) : msk.toLocalDate();
    }

    private final TaskCardRepository cardRepository;
    private final ChildTaskCardRepository childCardRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final HouseDayRepository houseDayRepository;
    private final BalanceService balanceService;
    private final AchievementService achievementService;
    private final DailyService dailyService;
    private final ObjectMapper objectMapper;

    public TaskCardService(TaskCardRepository cardRepository,
                           ChildTaskCardRepository childCardRepository,
                           ChildRepository childRepository,
                           UserRepository userRepository,
                           StoreRepository storeRepository,
                           HouseDayRepository houseDayRepository,
                           BalanceService balanceService,
                           AchievementService achievementService,
                           DailyService dailyService,
                           ObjectMapper objectMapper) {
        this.cardRepository = cardRepository;
        this.childCardRepository = childCardRepository;
        this.childRepository = childRepository;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.houseDayRepository = houseDayRepository;
        this.balanceService = balanceService;
        this.achievementService = achievementService;
        this.dailyService = dailyService;
        this.objectMapper = objectMapper;
    }

    // ---------- Родитель ----------

    @Transactional(readOnly = true)
    public List<TaskCardDto> listForParent(Long parentId, String skill) {
        return cardRepository.findByParentIdAndSkillOrderByCreatedAtDesc(parentId, skill)
                .stream().map(c -> toDto(c, null)).toList();
    }

    @Transactional
    public TaskCardDto create(Long parentId, TaskCardUpsertRequest request) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        TaskCard card = new TaskCard();
        card.setParent(parent);
        apply(card, request);
        card.setCreatedAt(Instant.now());
        return toDto(cardRepository.save(card), null);
    }

    @Transactional
    public TaskCardDto update(Long parentId, Long cardId, TaskCardUpsertRequest request) {
        TaskCard card = getOwned(parentId, cardId);
        apply(card, request);
        return toDto(cardRepository.save(card), null);
    }

    @Transactional
    public void delete(Long parentId, Long cardId) {
        cardRepository.delete(getOwned(parentId, cardId));
    }

    private void apply(TaskCard card, TaskCardUpsertRequest request) {
        if (request.skill() != null) {
            card.setSkill(request.skill().trim().toUpperCase());
        }
        if (request.title() != null) {
            card.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            card.setDescription(request.description());
        }
        if (request.icon() != null && !request.icon().isBlank()) {
            card.setIcon(request.icon().trim());
        }
        if (request.difficulty() != null) {
            card.setDifficulty(request.difficulty().trim().toUpperCase());
        }
        if (request.tasks() != null) {
            card.setTasksJson(toJson(request.tasks()));
        }
        if (request.durationMinutes() != null) {
            card.setDurationMinutes(request.durationMinutes());
        }
        if (request.rewardAmount() != null) {
            card.setRewardAmount(request.rewardAmount());
        }
        if (request.rewardStoreId() != null) {
            card.setRewardStore(storeRepository.findByIdAndParentId(request.rewardStoreId(), card.getParent().getId())
                    .orElseThrow(() -> new NotFoundException("Магазин не найден")));
        }
        if (request.xpReward() != null) {
            card.setXpReward(request.xpReward());
        }
        if (request.houseBonus() != null) {
            card.setHouseBonus(request.houseBonus());
        }
        if (request.rarity() != null) {
            card.setRarity(request.rarity().trim().toUpperCase());
        }
        if (request.hiddenReward() != null) {
            card.setHiddenReward(request.hiddenReward());
        }
        if (request.successPercent() != null) {
            card.setSuccessPercent(request.successPercent());
        }
        if (request.active() != null) {
            card.setActive(request.active());
        }
        if (request.childId() != null) {
            card.setChild(childRepository.findById(request.childId())
                    .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
        }
    }

    // ---------- Ребёнок ----------

    @Transactional(readOnly = true)
    public List<TaskCardDto> listForChild(Long childId, String skill) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        List<TaskCard> cards = cardRepository.findByParentIdAndSkillAndActiveTrueOrderByCreatedAtDesc(parentId, skill);
        LocalDate today = limitDay(Instant.now());
        List<ChildTaskCard> takenToday = childCardRepository.findByChildIdAndDay(childId, today);
        Map<Long, ChildTaskCard> taken = takenToday.stream()
                .collect(Collectors.toMap(c -> c.getCard().getId(), Function.identity()));

        // После выбора карточки остальные скрываются до следующего дня (09:00 МСК)
        if (!takenToday.isEmpty()) {
            return takenToday.stream()
                    .map(c -> toDto(c.getCard(), c))
                    .toList();
        }
        return cards.stream()
                .filter(c -> c.getChild() == null || c.getChild().getId().equals(childId))
                .map(c -> toDto(c, taken.get(c.getId())))
                .toList();
    }

    /**
     * Взять карточку: для MATH — 1 карта в день (остальные блокируются) и запрос
     * родителю (PENDING_PARENT); для HOUSE — карточка сразу раскрывается (REVEALED),
     * но активна только одна одновременно.
     */
    @Transactional
    public void take(Long childId, Long cardId) {
        TaskCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!card.isActive()) {
            throw new BadRequestException("Карточка неактивна");
        }
        if (card.getChild() != null && !card.getChild().getId().equals(childId)) {
            throw new NotFoundException("Карточка не найдена");
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        LocalDate today = limitDay(Instant.now());
        boolean hasActive = childCardRepository.findByChildIdAndDay(childId, today).stream()
                .anyMatch(c -> List.of("PENDING_PARENT", "REVEALED", "IN_PROGRESS").contains(c.getStatus()));
        if (hasActive) {
            throw new BadRequestException("Сначала заверши текущую карточку");
        }
        if (childCardRepository.findByChildIdAndCardIdAndDay(childId, cardId, today).isPresent()) {
            throw new BadRequestException("Карточка уже взята сегодня");
        }
        ChildTaskCard taken = new ChildTaskCard();
        taken.setChild(child);
        taken.setCard(card);
        taken.setDay(today);
        if ("HOUSE".equals(card.getSkill())) {
            taken.setStatus("REVEALED");
            taken.setStartedAt(Instant.now());
        } else {
            taken.setStatus("PENDING_PARENT");
        }
        childCardRepository.save(taken);
    }

    @Transactional(readOnly = true)
    public List<TaskCardDto> listPendingForParent(Long parentId, String skill) {
        return childCardRepository.findByCard_ParentIdAndStatus(parentId, "PENDING_PARENT").stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .filter(c -> skill == null || skill.isBlank() || skill.equalsIgnoreCase(c.getCard().getSkill()))
                .map(c -> toDto(c.getCard(), c))
                .toList();
    }

    /**
     * Родитель подтверждает: для MATH — карточка раскрывается и стартует таймер;
     * для HOUSE — помощь принята, начисляется +n к living_score (максимум +6/день).
     */
    @Transactional
    public TaskCardDto approve(Long parentId, Long childCardId) {
        ChildTaskCard taken = getOwnedChildCard(parentId, childCardId);
        if (!"PENDING_PARENT".equals(taken.getStatus())) {
            throw new BadRequestException("Запрос уже обработан");
        }
        TaskCard card = taken.getCard();
        if ("HOUSE".equals(card.getSkill())) {
            taken.setStatus("DONE");
            taken.setSubmittedAt(Instant.now());
            childCardRepository.save(taken);
            addHouseBonus(taken.getChild().getId(), card);
            dailyService.recordHouse(taken.getChild().getId());
            return toDto(card, taken);
        }
        taken.setStatus("REVEALED");
        taken.setStartedAt(Instant.now());
        return toDto(card, childCardRepository.save(taken));
    }

    @Transactional
    public void reject(Long parentId, Long childCardId) {
        ChildTaskCard taken = getOwnedChildCard(parentId, childCardId);
        if (!"PENDING_PARENT".equals(taken.getStatus())) {
            throw new BadRequestException("Запрос уже обработан");
        }
        childCardRepository.delete(taken);
    }

    /**
     * Сдача карточки: для MATH — подсчёт % успешных ответов и награда при результате
     * не ниже порога; для HOUSE — отправка отчёта родителю (PENDING_PARENT).
     */
    @Transactional
    public TaskCardDto submit(Long childId, Long childCardId, TaskCardSubmitRequest request) {
        ChildTaskCard taken = childCardRepository.findByIdAndChildId(childCardId, childId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!"REVEALED".equals(taken.getStatus()) && !"IN_PROGRESS".equals(taken.getStatus())) {
            throw new BadRequestException("Карточка не в работе");
        }
        TaskCard card = taken.getCard();
        List<TaskItem> tasks = fromJson(card.getTasksJson());
        List<String> answers = request.answers() == null ? List.of() : request.answers();
        taken.setAnswersJson(toJson(answers));
        taken.setSubmittedAt(Instant.now());

        if ("HOUSE".equals(card.getSkill())) {
            // отчёт родителю: помощь принята → +n к living_score (см. approve)
            taken.setStatus("PENDING_PARENT");
            childCardRepository.save(taken);
            return toDto(card, taken);
        }

        int correct = 0;
        for (int i = 0; i < tasks.size(); i++) {
            String given = i < answers.size() ? answers.get(i) : "";
            if (given != null && given.trim().equalsIgnoreCase(tasks.get(i).a().trim())) {
                correct++;
            }
        }
        int percent = tasks.isEmpty() ? 0 : Math.round(correct * 100f / tasks.size());
        boolean success = percent >= card.getSuccessPercent();
        taken.setResultPercent(percent);
        taken.setStatus(success ? "DONE" : "FAILED");
        childCardRepository.save(taken);

        if (success && card.getRewardStore() != null && card.getRewardAmount().signum() > 0) {
            balanceService.credit(childId, card.getRewardStore().getId(), card.getRewardAmount());
        }
        achievementService.checkProgress(childId);
        return toDto(card, taken);
    }

    /** +n к living_score в календаре дома (максимум +6 в день). */
    private void addHouseBonus(Long childId, TaskCard card) {
        if (card.getHouseBonus() <= 0 || card.getStore() == null) {
            return;
        }
        LocalDate today = limitDay(Instant.now());
        HouseDay day = houseDayRepository.findByStoreIdAndChildIdAndDay(card.getStore().getId(), childId, today)
                .orElseGet(() -> {
                    HouseDay d = new HouseDay();
                    d.setStore(card.getStore());
                    d.setChild(childRepository.getReferenceById(childId));
                    d.setDay(today);
                    return d;
                });
        int bonus = Math.min(MAX_HOUSE_BONUS_PER_DAY - day.getLivingScore(), card.getHouseBonus());
        if (bonus > 0) {
            day.setLivingScore(day.getLivingScore() + bonus);
            day.setPoints(day.getPoints().add(BigDecimal.valueOf(bonus)));
            houseDayRepository.save(day);
        }
    }

    // ---------- DTO ----------

    private TaskCardDto toDto(TaskCard card, ChildTaskCard taken) {
        return new TaskCardDto(
                card.getId(),
                card.getSkill(),
                card.getTitle(),
                card.getDescription(),
                card.getIcon(),
                card.getDifficulty(),
                fromJson(card.getTasksJson()),
                card.getDurationMinutes(),
                card.getRewardAmount(),
                card.getRewardStore() == null ? null : card.getRewardStore().getId(),
                card.getRewardStore() == null ? null : card.getRewardStore().getCurrencyName(),
                card.getRewardStore() == null ? null : card.getRewardStore().getCurrencyIcon(),
                card.getXpReward(),
                card.getHouseBonus(),
                card.getRarity(),
                card.isHiddenReward(),
                card.getSuccessPercent(),
                card.isActive(),
                taken == null ? null : taken.getStatus(),
                taken == null ? null : taken.getStartedAt(),
                taken == null ? null : taken.getResultPercent());
    }

    private TaskCard getOwned(Long parentId, Long cardId) {
        return cardRepository.findByIdAndParentId(cardId, parentId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
    }

    private ChildTaskCard getOwnedChildCard(Long parentId, Long childCardId) {
        return childCardRepository.findById(childCardId)
                .filter(c -> c.getCard().getParent().getId().equals(parentId))
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<TaskItem> fromJson(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<TaskItem>>() {
            });
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}