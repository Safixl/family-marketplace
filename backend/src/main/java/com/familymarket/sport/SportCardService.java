package com.familymarket.sport;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.notification.NotificationService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.daily.DailyLog;
import com.familymarket.daily.DailyLogRepository;
import com.familymarket.dto.SportCardDto;
import com.familymarket.dto.SportCardReviewDto;
import com.familymarket.dto.SportRequestDto;
import com.familymarket.dto.SportDirectionDto;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Навык «Спорт и хобби»: путь к новым увлечениям.
 * — Дефолтное направление «Физкультура» с набором упражнений по классам (2–8);
 *   дейлик-карточка генерируется из случайных упражнений.
 * — Ребёнок отправляет запрос на новое направление (карате, шахматы…), родитель
 *   создаёт направление и задания; направлений может быть до 6.
 * — Дейлик за день один: ребёнок выбирает направление, отмечает выполнение,
 *   родитель проверяет с множителем 0/1/2, умножающим все награды.
 */
@Service
public class SportCardService {

    private static final int MAX_DIRECTIONS = 6;
    private static final int PE_EXERCISES_PER_CARD = 5;
    private static final int HOBBY_TASKS_PER_CARD = 3;
    private static final int BASE_REWARD = 10;
    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    private final SportDirectionRepository directionRepository;
    private final SportTaskRepository taskRepository;
    private final SportRequestRepository requestRepository;
    private final SportCardRepository cardRepository;
    private final SportCardTaskRepository cardTaskRepository;
    private final DailyLogRepository dailyLogRepository;
    private final ChildRepository childRepository;
    private final AchievementService achievementService;
    private final StoreRepository storeRepository;
    private final BalanceService balanceService;
    private final NotificationService notificationService;
    private final SportSeed seed;

    public SportCardService(SportDirectionRepository directionRepository,
                            SportTaskRepository taskRepository,
                            SportRequestRepository requestRepository,
                            SportCardRepository cardRepository,
                            SportCardTaskRepository cardTaskRepository,
                            DailyLogRepository dailyLogRepository,
                            ChildRepository childRepository,
                            AchievementService achievementService,
                            StoreRepository storeRepository,
                            BalanceService balanceService,
                            NotificationService notificationService,
                            SportSeed seed) {
        this.directionRepository = directionRepository;
        this.taskRepository = taskRepository;
        this.requestRepository = requestRepository;
        this.cardRepository = cardRepository;
        this.cardTaskRepository = cardTaskRepository;
        this.dailyLogRepository = dailyLogRepository;
        this.childRepository = childRepository;
        this.achievementService = achievementService;
        this.storeRepository = storeRepository;
        this.balanceService = balanceService;
        this.notificationService = notificationService;
        this.seed = seed;
    }

    // ---------- Направления ----------

    /** Дефолтная «Физкультура» с сид-упражнениями (идемпотентно). */
    @Transactional
    public void ensureDirections(Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (directionRepository.findByChildIdOrderByIdAsc(childId).isEmpty()) {
            SportDirection pe = new SportDirection();
            pe.setChild(child);
            pe.setName("Физкультура");
            pe.setIcon("🏃");
            pe.setStatus("ACTIVE");
            pe.setCreatedAt(Instant.now());
            pe = directionRepository.save(pe);
            seedPeTasks(pe);
        }
    }

    private void seedPeTasks(SportDirection pe) {
        int order = 0;
        for (SportSeed.SeedTask t : seed.peTasks()) {
            SportTask task = new SportTask();
            task.setDirection(pe);
            task.setTitle(t.title());
            task.setDescription(t.description());
            task.setGradeMin(t.gradeMin());
            task.setGradeMax(t.gradeMax());
            task.setSortOrder(order++);
            taskRepository.save(task);
        }
    }

    @Transactional(readOnly = true)
    public List<SportDirection> directions(Long childId) {
        ensureDirections(childId);
        return directionRepository.findByChildIdAndStatusOrderByIdAsc(childId, "ACTIVE");
    }

    /** Создание направления родителем (по запросу ребёнка или по своей инициативе). Максимум 6. */
    @Transactional
    public SportDirection createDirection(Long parentId, Long childId, String name, String icon, Long requestId) {
        Child child = ownedChild(parentId, childId);
        if (directionRepository.countByChildIdAndStatus(childId, "ACTIVE") >= MAX_DIRECTIONS) {
            throw new BadRequestException("Максимум " + MAX_DIRECTIONS + " направлений");
        }
        SportDirection direction = new SportDirection();
        direction.setChild(child);
        direction.setName(name == null || name.isBlank() ? "Новое направление" : name.trim());
        direction.setIcon(icon == null || icon.isBlank() ? "🎯" : icon.trim());
        direction.setCreatedAt(Instant.now());
        direction = directionRepository.save(direction);
        if (requestId != null) {
            SportRequest request = requestRepository.findById(requestId)
                    .orElseThrow(() -> new NotFoundException("Запрос не найден"));
            if (!request.getChild().getId().equals(childId)) {
                throw new NotFoundException("Запрос не найден");
            }
            request.setStatus("RESOLVED");
            requestRepository.save(request);
        }
        return direction;
    }

    /** Направления ребёнка для панели родителя (с числом заданий). */
    @Transactional(readOnly = true)
    public List<SportDirectionInfo> parentDirections(Long parentId, Long childId) {
        ownedChild(parentId, childId);
        ensureDirections(childId);
        List<SportDirectionInfo> out = new ArrayList<>();
        for (SportDirection d : directionRepository.findByChildIdOrderByIdAsc(childId)) {
            out.add(new SportDirectionInfo(d.getId(), childId, d.getName(), d.getIcon(), d.getStatus(),
                    taskRepository.findByDirectionIdOrderBySortOrderAscIdAsc(d.getId()).size()));
        }
        return out;
    }

    public record SportDirectionInfo(Long id, Long childId, String name, String icon, String status, int taskCount) {
    }

    // ---------- Задания направления (редактирует родитель) ----------

    @Transactional
    public List<SportTask> tasks(Long directionId) {
        return taskRepository.findByDirectionIdOrderBySortOrderAscIdAsc(directionId);
    }

    @Transactional
    public SportTask addTask(Long parentId, Long directionId, String title, String description,
                             Integer gradeMin, Integer gradeMax) {
        SportDirection direction = ownedDirection(parentId, directionId);
        int nextOrder = taskRepository.findByDirectionIdOrderBySortOrderAscIdAsc(directionId).size();
        SportTask task = new SportTask();
        task.setDirection(direction);
        task.setTitle(title == null || title.isBlank() ? "Новое задание" : title.trim());
        task.setDescription(description == null ? "" : description.trim());
        task.setGradeMin(gradeMin == null ? 1 : Math.max(1, gradeMin));
        task.setGradeMax(gradeMax == null ? 8 : Math.min(8, Math.max(gradeMin == null ? 1 : gradeMin, gradeMax)));
        task.setSortOrder(nextOrder);
        return taskRepository.save(task);
    }

    @Transactional
    public SportTask updateTask(Long parentId, Long taskId, String title, String description,
                                Integer gradeMin, Integer gradeMax) {
        SportTask task = ownedTask(parentId, taskId);
        if (title != null && !title.isBlank()) {
            task.setTitle(title.trim());
        }
        if (description != null) {
            task.setDescription(description.trim());
        }
        if (gradeMin != null) {
            task.setGradeMin(Math.max(1, gradeMin));
        }
        if (gradeMax != null) {
            task.setGradeMax(Math.min(8, gradeMax));
        }
        if (task.getGradeMax() < task.getGradeMin()) {
            task.setGradeMax(task.getGradeMin());
        }
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long parentId, Long taskId) {
        SportTask task = ownedTask(parentId, taskId);
        taskRepository.delete(task);
    }

    // ---------- Запросы ребёнка ----------

    @Transactional
    public void requestDirection(Long childId, String name, String comment) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Напиши название направления");
        }
        SportRequest request = new SportRequest();
        request.setChild(child);
        request.setName(name.trim());
        request.setComment(comment == null ? "" : comment.trim());
        request.setCreatedAt(Instant.now());
        requestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<SportRequestDto> parentRequests(Long parentId) {
        return requestRepository.findPendingByParent(parentId).stream()
                .map(SportRequestDto::of)
                .toList();
    }

    @Transactional
    public void rejectRequest(Long parentId, Long requestId) {
        SportRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Запрос не найден"));
        if (!request.getChild().getParent().getId().equals(parentId)) {
            throw new NotFoundException("Запрос не найден");
        }
        request.setStatus("REJECTED");
        requestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<SportRequestDto> childRequests(Long childId) {
        // Маппим внутри транзакции: ленивый прокси ребёнка недоступен после её закрытия
        return requestRepository.findByChildIdOrderByCreatedAtDesc(childId).stream()
                .map(SportRequestDto::of)
                .toList();
    }

    // ---------- Дейлик-карточка ----------

    /** Состояние дня: направления + карточка (если уже сгенерирована). */
    @Transactional
    public SportDayDto day(Long childId) {
        ensureDirections(childId);
        LocalDate today = todayDate();
        SportCard card = cardRepository.findByChildIdAndCardDate(childId, today).orElse(null);
        return new SportDayDto(
                directions(childId).stream().map(d -> SportDirectionDto.of(d,
                        card != null && card.getDirection().getId().equals(d.getId()))).toList(),
                card == null ? null : SportCardDto.of(card, cardTaskRepository.findByCardIdOrderByIdAsc(card.getId())));
    }

    public record SportDayDto(List<SportDirectionDto> directions, SportCardDto card) {
    }

    /** Генерация дейлика из выбранного направления. 1 карточка в день. */
    @Transactional
    public SportCardDto generate(Long childId, Long directionId) {
        ensureDirections(childId);
        LocalDate today = todayDate();
        if (cardRepository.findByChildIdAndCardDate(childId, today).isPresent()) {
            throw new BadRequestException("Дейлик по спорту на сегодня уже выбран");
        }
        SportDirection direction = directionRepository.findById(directionId)
                .orElseThrow(() -> new NotFoundException("Направление не найдено"));
        if (!direction.getChild().getId().equals(childId) || !"ACTIVE".equals(direction.getStatus())) {
            throw new NotFoundException("Направление не найдено");
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        int grade = seed.gradeFromAge(child.getAge() == null ? 7 : child.getAge());

        List<SportTask> pool = taskRepository.findByDirectionIdOrderBySortOrderAscIdAsc(directionId);
        if (pool.isEmpty()) {
            throw new BadRequestException("В направлении пока нет заданий");
        }
        // Для физкультуры — упражнения по классу; для хобби — любые задания направления.
        // Оборачиваем в mutable-список: .toList() даёт иммутабельный, shuffle падает.
        List<SportTask> eligible = new ArrayList<>("Физкультура".equals(direction.getName())
                ? pool.stream().filter(t -> grade >= t.getGradeMin() && grade <= t.getGradeMax()).toList()
                : pool);
        if (eligible.isEmpty()) {
            eligible = new ArrayList<>(pool);
        }
        Collections.shuffle(eligible);
        int count = Math.min("Физкультура".equals(direction.getName()) ? PE_EXERCISES_PER_CARD : HOBBY_TASKS_PER_CARD,
                eligible.size());

        SportCard card = new SportCard();
        card.setChild(child);
        card.setCardDate(today);
        card.setDirection(direction);
        card.setStatus("CREATED");
        card.setBaseReward(BASE_REWARD);
        card.setCreatedAt(Instant.now());
        card = cardRepository.save(card);

        List<SportCardTask> cardTasks = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            SportCardTask ct = new SportCardTask();
            ct.setCard(card);
            ct.setTitle(eligible.get(i).getTitle());
            ct.setDescription(eligible.get(i).getDescription());
            cardTasks.add(ct);
        }
        cardTaskRepository.saveAll(cardTasks);
        return SportCardDto.of(card, cardTasks);
    }

    /** «Выполнено» — уходит родителю на проверку с множителем 0/1/2. */
    @Transactional
    public SportCardDto submit(Long childId, Long cardId) {
        SportCard card = ownedCard(childId, cardId);
        if (!"CREATED".equals(card.getStatus())) {
            throw new BadRequestException("Карточка уже отправлена или завершена");
        }
        card.setStatus("REVIEW");
        card.setSubmittedAt(Instant.now());
        cardRepository.save(card);
        syncDailySport(childId, card.getCardDate());
        achievementService.checkProgress(childId);
        // Уведомление родителю: дейлик спорта ждёт проверки (×0/×1/×2)
        notificationService.create(childId, "SPORT_REVIEW",
                "Спорт-дейлик на проверке",
                card.getDirection().getName() + " — оцени результат: ×0 / ×1 / ×2",
                "sport-card", cardId);
        return SportCardDto.of(card, cardTaskRepository.findByCardIdOrderByIdAsc(cardId));
    }

    /** Родитель проверяет дейлик: ×0 — отклонить, ×1 — зачесть, ×2 — двойная награда. */
    @Transactional
    public void review(Long parentId, Long cardId, int multiplier, String comment) {
        SportCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!card.getChild().getParent().getId().equals(parentId)) {
            throw new NotFoundException("Карточка не найдена");
        }
        if (!"REVIEW".equals(card.getStatus())) {
            throw new BadRequestException("Карточка не на проверке");
        }
        if (multiplier < 0 || multiplier > 2) {
            throw new BadRequestException("Множитель должен быть 0, 1 или 2");
        }
        int xpEarned = card.getBaseReward() * multiplier;
        card.setMultiplier(multiplier);
        card.setXpEarned(xpEarned);
        card.setStatus(multiplier > 0 ? "SUCCESS" : "FAILED");
        if (comment != null && !comment.isBlank()) {
            card.setParentComment(comment.trim());
        }
        cardRepository.save(card);
        // Уведомление о проверке закрыто — родитель оценил дейлик
        notificationService.markDoneByRef("sport-card", cardId);
        if (xpEarned > 0) {
            creditSportPoints(card.getChild().getId(), parentId, xpEarned);
            achievementService.checkProgress(card.getChild().getId());
        }
    }

    @Transactional(readOnly = true)
    public List<SportCardReviewDto> parentReviews(Long parentId) {
        return cardRepository.findByParentReview(parentId).stream()
                .map(c -> SportCardReviewDto.of(c, cardTaskRepository.findByCardIdOrderByIdAsc(c.getId())))
                .toList();
    }

    // ---------- Внутреннее ----------

    /**
     * Дейлик «Спорт»: points = 1, если карточка дня отправлена родителю или зачтена,
     * full clear (1 карточка) даёт бонус +2 XP как у прочих дейликов.
     */
    private void syncDailySport(Long childId, LocalDate day) {
        DailyLog log = dailyLogRepository.findByChildIdAndSkillAndDay(childId, "SPORT", day)
                .orElseGet(() -> {
                    DailyLog created = new DailyLog();
                    created.setChild(childRepository.findById(childId)
                            .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
                    created.setSkill("SPORT");
                    created.setDay(day);
                    created.setCreatedAt(Instant.now());
                    return created;
                });
        log.setPayload("{\"done\":\"0\"}");
        log.setPoints(BigDecimal.ONE);
        log.setFullClear(true);
        log.setXp(2);
        dailyLogRepository.save(log);
    }

    /** Очки спорта = XP 1:1 в баланс магазина «Спорт». */
    private void creditSportPoints(Long childId, Long parentId, long amount) {
        if (amount <= 0) {
            return;
        }
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "SPORT").orElse(null);
        if (store != null) {
            balanceService.credit(childId, store.getId(), BigDecimal.valueOf(amount));
        }
    }

    private Child ownedChild(Long parentId, Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (!child.getParent().getId().equals(parentId)) {
            throw new NotFoundException("Ребенок не найден");
        }
        return child;
    }

    private SportDirection ownedDirection(Long parentId, Long directionId) {
        SportDirection direction = directionRepository.findById(directionId)
                .orElseThrow(() -> new NotFoundException("Направление не найдено"));
        if (!direction.getChild().getParent().getId().equals(parentId)) {
            throw new NotFoundException("Направление не найдено");
        }
        return direction;
    }

    private SportTask ownedTask(Long parentId, Long taskId) {
        SportTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Задание не найдено"));
        if (!task.getDirection().getChild().getParent().getId().equals(parentId)) {
            throw new NotFoundException("Задание не найдено");
        }
        return task;
    }

    private SportCard ownedCard(Long childId, Long cardId) {
        SportCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!card.getChild().getId().equals(childId)) {
            throw new NotFoundException("Карточка не найдена");
        }
        return card;
    }

    private static LocalDate todayDate() {
        return com.familymarket.daily.DailiesDay.current();
    }
}
