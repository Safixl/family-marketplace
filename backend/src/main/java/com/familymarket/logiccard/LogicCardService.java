package com.familymarket.logiccard;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.daily.DailyLog;
import com.familymarket.daily.DailyLogRepository;
import com.familymarket.dto.LogicCardAdminDayDto;
import com.familymarket.dto.LogicCardAdminDto;
import com.familymarket.dto.LogicCardApprovalDto;
import com.familymarket.dto.LogicCardDayDto;
import com.familymarket.dto.LogicCardDto;
import com.familymarket.dto.LogicCardSubmitResult;
import com.familymarket.dto.LogicTopicDto;
import com.familymarket.dto.LogicTopicSettingsItemRequest;
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
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Микросервис динамической генерации логических карточек (зеркало MathCardService).
 * Жизненный цикл карточки: CREATED → REQUESTED (запрос родителю) → APPROVED →
 * IN_PROGRESS (единый серверный таймер) → SUCCESS/FAILED (проверка одним сабмитом).
 * XP в навык «Логика»: за каждую верную задачу (по уровню 1..10) + награда за
 * карточку ≥80% (при 100% удваивается). Дейлик «Логика» синхронизируется по числу
 * завершённых карточек дня, «IQ-коины» начисляются 1:1 с XP в магазин «Логика».
 */
@Service
public class LogicCardService {

    private static final int TASK_COUNT[] = {6, 8, 10, 10, 12, 0, 0}; // EASY..OLYMPIAD, REVIEW (0 — из шаблона)
    private static final int SUCCESS_PERCENT = 80;
    private static final int DAILY_LIMIT = 3;
    /** День стартует в 9:00 (МСК) — как в лимитах и математических карточках. */
    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    private final LogicTopicRepository topicRepository;
    private final LogicTopicSettingsRepository settingsRepository;
    private final LogicCardRepository cardRepository;
    private final LogicCardTaskRepository taskRepository;
    private final LogicCardAttemptRepository attemptRepository;
    private final LogicOlympiadRepository olympiadRepository;
    private final LogicOlympiadTaskRepository olympiadTaskRepository;
    private final DailyLogRepository dailyLogRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final LogicCardGenerator generator;
    private final AchievementService achievementService;
    private final StoreRepository storeRepository;
    private final BalanceService balanceService;

    public LogicCardService(LogicTopicRepository topicRepository,
                            LogicTopicSettingsRepository settingsRepository,
                            LogicCardRepository cardRepository,
                            LogicCardTaskRepository taskRepository,
                            LogicCardAttemptRepository attemptRepository,
                            LogicOlympiadRepository olympiadRepository,
                            LogicOlympiadTaskRepository olympiadTaskRepository,
                            DailyLogRepository dailyLogRepository,
                            ChildRepository childRepository,
                            UserRepository userRepository,
                            LogicCardGenerator generator,
                            AchievementService achievementService,
                            StoreRepository storeRepository,
                            BalanceService balanceService) {
        this.topicRepository = topicRepository;
        this.settingsRepository = settingsRepository;
        this.cardRepository = cardRepository;
        this.taskRepository = taskRepository;
        this.attemptRepository = attemptRepository;
        this.olympiadRepository = olympiadRepository;
        this.olympiadTaskRepository = olympiadTaskRepository;
        this.dailyLogRepository = dailyLogRepository;
        this.childRepository = childRepository;
        this.userRepository = userRepository;
        this.generator = generator;
        this.achievementService = achievementService;
        this.storeRepository = storeRepository;
        this.balanceService = balanceService;
    }

    // ---------- Темы и настройки родителя ----------

    @Transactional
    public void ensureTopics(Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        for (LogicTopic topic : topicRepository.findAllByOrderBySortOrderAsc()) {
            if (settingsRepository.findByParentIdAndTopicId(parentId, topic.getId()).isEmpty()) {
                LogicTopicSettings settings = new LogicTopicSettings();
                settings.setParent(parent);
                settings.setTopic(topic);
                settings.setActive(true);
                settings.setBaseDifficulty("MEDIUM");
                settingsRepository.save(settings);
            }
        }
        seedOlympiadTemplates();
    }

    @Transactional
    public List<LogicTopicDto> parentSettings(Long parentId) {
        ensureTopics(parentId);
        List<LogicTopic> topics = topicRepository.findAllByOrderBySortOrderAsc();
        List<LogicTopicSettings> settings = settingsRepository.findByParentId(parentId);
        return topics.stream()
                .map(t -> LogicTopicDto.of(t, settings.stream()
                        .filter(s -> s.getTopic().getId().equals(t.getId()))
                        .findFirst().orElse(null)))
                .toList();
    }

    @Transactional
    public List<LogicTopicDto> updateSettings(Long parentId, List<LogicTopicSettingsItemRequest> items) {
        ensureTopics(parentId);
        List<LogicTopicSettings> existing = settingsRepository.findByParentId(parentId);
        for (LogicTopicSettingsItemRequest item : items) {
            LogicTopicSettings settings = existing.stream()
                    .filter(s -> s.getTopic().getId().equals(item.topicId()))
                    .findFirst().orElseThrow(() -> new NotFoundException("Тема не найдена"));
            if (item.active() != null) {
                settings.setActive(item.active());
            }
            if (item.baseDifficulty() != null) {
                settings.setBaseDifficulty(parseBase(item.baseDifficulty()).name());
            }
            settingsRepository.save(settings);
        }
        return parentSettings(parentId);
    }

    // ---------- Карточки: просмотр и генерация ----------

    /** Карточки дня (отсортированы по сложности) + счётчик решённых (лимит 3 в день, сброс в 9:00). */
    @Transactional
    public LogicCardDayDto listToday(Long childId) {
        expireOverdue(childId);
        LocalDate today = todayDate();
        long doneToday = cardRepository.countByChildIdAndCardDateAndFinalLevelNotAndStatusIn(
                childId, today, "REVIEW", List.of("SUCCESS", "FAILED"));
        // После лимита показываем завершённые карточки (статусы и награды), не взятые скрываются
        List<LogicCard> dayCards = cardRepository.findByChildIdAndCardDateOrderByCreatedAtDesc(childId, today);
        if (doneToday >= DAILY_LIMIT) {
            dayCards = dayCards.stream()
                    .filter(c -> "SUCCESS".equals(c.getStatus()) || "FAILED".equals(c.getStatus())
                            || "REVIEW".equals(c.getFinalLevel()))
                    .toList();
        }
        List<LogicCardDto> cards = dayCards.stream()
                .sorted(Comparator.comparingInt(c -> LogicDifficulty.valueOf(c.getFinalLevel()).ordinal()))
                .map(c -> LogicCardDto.of(c, taskRepository.findByCardIdOrderByIdAsc(c.getId()), includeTasks(c)))
                .toList();
        return new LogicCardDayDto(cards, (int) doneToday, DAILY_LIMIT);
    }

    @Transactional
    public LogicCardDto generate(Long childId, String choice) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Long parentId = child.getParent().getId();
        ensureTopics(parentId);
        expireOverdue(childId);

        LocalDate today = todayDate();
        // Пока карточка решается — другие не создаём, отдаём активную
        List<LogicCard> active = cardRepository.findByChildIdAndCardDateAndStatus(childId, today, "IN_PROGRESS");
        if (!active.isEmpty()) {
            LogicCard inProgress = active.get(0);
            return LogicCardDto.of(inProgress, taskRepository.findByCardIdOrderByIdAsc(inProgress.getId()), true);
        }

        // Карточка выбранной сложности уже есть в дневном плане — возвращаем её
        LogicDifficulty finalLevel = resolveFinal(childId, parentId, choice);
        LogicCard existing = cardRepository
                .findFirstByChildIdAndCardDateAndFinalLevelOrderByIdDesc(childId, today, finalLevel.name())
                .orElse(null);
        if (existing != null) {
            return LogicCardDto.of(existing, taskRepository.findByCardIdOrderByIdAsc(existing.getId()), includeTasks(existing));
        }

        // Лимит по ВСЕМ карточкам дня (включая незавершённые): нельзя перегенерировать
        long doneToday = cardRepository.countByChildIdAndCardDate(childId, today);
        if (doneToday >= DAILY_LIMIT) {
            throw new BadRequestException("Лимит карточек на день исчерпан (3). Новые появятся завтра в 9:00");
        }

        LogicCard card = buildCard(child, parentId, today, finalLevel);
        List<LogicCardTask> tasks = buildTasks(childId, card, parentId, finalLevel);
        card.setTaskCount(tasks.size());
        card.setTaskTypes(String.join(",", taskTypeSet(tasks)));
        card.setXpReward(finalLevel.getSuccessReward());
        card.setStatus("CREATED");
        cardRepository.save(card);
        taskRepository.saveAll(tasks);
        return LogicCardDto.of(card, tasks, false);
    }

    // ---------- Жизненный цикл (ребёнок) ----------

    /** «Взять задачу» — запрос родителю на одобрение. */
    @Transactional
    public LogicCardDto request(Long childId, Long cardId) {
        LogicCard card = ownedCard(childId, cardId);
        if (!"CREATED".equals(card.getStatus())) {
            throw new BadRequestException("Карточка уже взята");
        }
        card.setStatus("REQUESTED");
        cardRepository.save(card);
        return LogicCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), false);
    }

    /** Отзыв запроса (повторное нажатие «Ожидает одобрения»). */
    @Transactional
    public LogicCardDto revoke(Long childId, Long cardId) {
        LogicCard card = ownedCard(childId, cardId);
        if (!"REQUESTED".equals(card.getStatus())) {
            throw new BadRequestException("Отозвать можно только ожидающий одобрения запрос");
        }
        card.setStatus("CREATED");
        cardRepository.save(card);
        return LogicCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), false);
    }

    /** «Начать задачу» — старт таймера. «Работа над ошибками» — без таймера, можно повторно. */
    @Transactional
    public LogicCardDto start(Long childId, Long cardId) {
        LogicCard card = ownedCard(childId, cardId);
        boolean review = "REVIEW".equals(card.getFinalLevel());
        boolean startable = review
                ? List.of("APPROVED", "SUCCESS", "FAILED").contains(card.getStatus())
                : "APPROVED".equals(card.getStatus());
        if (!startable) {
            throw new BadRequestException("Карточка ещё не одобрена родителем");
        }
        if (!cardRepository.findByChildIdAndCardDateAndStatus(childId, card.getCardDate(), "IN_PROGRESS").isEmpty()) {
            throw new BadRequestException("Сначала завершите текущую карточку");
        }
        Instant now = Instant.now();
        card.setStatus("IN_PROGRESS");
        card.setStartedAt(now);
        // «Работа над ошибками» (minutes = 0) — без таймера
        card.setDeadline(card.getMinutes() > 0 ? now.plusSeconds(card.getMinutes() * 60L) : null);
        cardRepository.save(card);
        return LogicCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), true);
    }

    /** Отправка на проверку (одной кнопкой): проверка всех ответов, начисление XP. */
    @Transactional
    public LogicCardSubmitResult submit(Long childId, Long cardId, List<String> answers) {
        LogicCard card = ownedCard(childId, cardId);
        expireOverdue(childId);
        if (!"IN_PROGRESS".equals(card.getStatus()) && !"PAUSED".equals(card.getStatus())) {
            throw new BadRequestException("Карточка не в работе");
        }
        List<LogicCardTask> tasks = taskRepository.findByCardIdOrderByIdAsc(cardId);
        LogicDifficulty level = LogicDifficulty.valueOf(card.getFinalLevel());

        List<String> list = answers == null ? List.of() : answers;
        int correct = 0;
        for (int i = 0; i < tasks.size(); i++) {
            String given = i < list.size() ? list.get(i) : "";
            boolean ok = normalize(tasks.get(i).getAnswer()).equals(normalize(given));
            if (ok) {
                correct++;
            }
            LogicCardAttempt attempt = new LogicCardAttempt();
            attempt.setTask(tasks.get(i));
            attempt.setAnswer(given == null ? "" : given.trim());
            attempt.setCorrect(ok);
            attempt.setAttemptedAt(Instant.now());
            attemptRepository.save(attempt);
        }

        int percent = tasks.isEmpty() ? 0 : (int) Math.round(correct * 100.0 / tasks.size());
        boolean success = percent >= SUCCESS_PERCENT;
        int perTaskXp = correct * level.getPerExampleXp();
        int successReward = success ? level.getSuccessReward() * (percent == 100 ? 2 : 1) : 0;
        int xpEarned = perTaskXp + successReward;

        card.setStatus(success ? "SUCCESS" : "FAILED");
        card.setResultPercent(percent);
        card.setSubmittedAt(Instant.now());
        card.setXpEarned(xpEarned);
        cardRepository.save(card);
        // «IQ-коины» = XP логики 1:1: начисляем в баланс магазина «Логика»
        creditIqCoins(childId, card.getChild().getParent().getId(), xpEarned);
        // Синхронизация дейлика «Логика»: счётчик = число завершённых карточек дня
        syncDailyLogic(childId, card.getCardDate());
        // После 3/3 дня создаём карточку «Работа над ошибками» из неверных ответов
        maybeCreateReviewCard(childId, card.getChild().getParent().getId(), card.getCardDate());
        // Авто-начисление достижений
        achievementService.checkProgress(childId);
        return new LogicCardSubmitResult(percent, success, correct, tasks.size(), perTaskXp, successReward, xpEarned);
    }

    /** «Свернуть» — пауза таймера; карточку можно оставить на паузе и начать другую. */
    @Transactional
    public LogicCardDto pause(Long childId, Long cardId) {
        LogicCard card = ownedCard(childId, cardId);
        if (!"IN_PROGRESS".equals(card.getStatus())) {
            throw new BadRequestException("На паузу можно поставить только начатую карточку");
        }
        Instant now = Instant.now();
        long remaining = card.getDeadline() != null
                ? Math.max(60, java.time.Duration.between(now, card.getDeadline()).getSeconds())
                : 600;
        card.setRemainingSeconds((int) remaining);
        card.setDeadline(null);
        card.setStatus("PAUSED");
        cardRepository.save(card);
        return LogicCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), true);
    }

    /** «Продолжить» — возобновить свёрнутую карточку (таймер продолжается с остатка). */
    @Transactional
    public LogicCardDto resume(Long childId, Long cardId) {
        LogicCard card = ownedCard(childId, cardId);
        if (!"PAUSED".equals(card.getStatus())) {
            throw new BadRequestException("Возобновить можно только карточку на паузе");
        }
        if (!cardRepository.findByChildIdAndCardDateAndStatus(childId, card.getCardDate(), "IN_PROGRESS").isEmpty()) {
            throw new BadRequestException("Сначала завершите текущую карточку");
        }
        card.setStatus("IN_PROGRESS");
        if (card.getRemainingSeconds() != null) {
            card.setDeadline(Instant.now().plusSeconds(card.getRemainingSeconds()));
            card.setRemainingSeconds(null);
        }
        cardRepository.save(card);
        return LogicCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), true);
    }

    // ---------- Одобрение родителем ----------

    @Transactional(readOnly = true)
    public List<LogicCardApprovalDto> parentApprovals(Long parentId) {
        return cardRepository.findByParentRequested(parentId).stream()
                .map(LogicCardApprovalDto::of)
                .toList();
    }

    @Transactional
    public void approve(Long parentId, Long cardId) {
        LogicCard card = ownedByParent(parentId, cardId);
        if (!"REQUESTED".equals(card.getStatus())) {
            throw new BadRequestException("Запроса на одобрение нет");
        }
        card.setStatus("APPROVED");
        cardRepository.save(card);
    }

    @Transactional
    public void reject(Long parentId, Long cardId) {
        LogicCard card = ownedByParent(parentId, cardId);
        if (!"REQUESTED".equals(card.getStatus())) {
            throw new BadRequestException("Запроса на одобрение нет");
        }
        card.setStatus("CREATED");
        cardRepository.save(card);
    }

    // ---------- Родитель: карточки дня и перегенерация ----------

    /**
     * Карточки дня ребёнка для родителя: задачи с ответами + прогресс (решено/лимит).
     * Дневной план — карточка каждой сложности: недостающие генерируются автоматически.
     */
    @Transactional
    public LogicCardAdminDayDto parentDay(Long parentId, Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (!child.getParent().getId().equals(parentId)) {
            throw new NotFoundException("Ребенок не найден");
        }
        ensureTopics(parentId);
        expireOverdue(childId);
        LocalDate today = todayDate();
        ensureDayPlan(child, parentId, today);
        long doneToday = cardRepository.countByChildIdAndCardDateAndFinalLevelNotAndStatusIn(
                childId, today, "REVIEW", List.of("SUCCESS", "FAILED"));
        List<LogicCard> dayCards = cardRepository.findByChildIdAndCardDateOrderByCreatedAtDesc(childId, today);
        // Последние попытки ребёнка по каждой задаче дня (для показа верных/неверных ответов)
        Map<Long, List<LogicCardTask>> tasksByCard = new HashMap<>();
        List<Long> dayTaskIds = new ArrayList<>();
        for (LogicCard card : dayCards) {
            List<LogicCardTask> tasks = taskRepository.findByCardIdOrderByIdAsc(card.getId());
            tasksByCard.put(card.getId(), tasks);
            tasks.forEach(t -> dayTaskIds.add(t.getId()));
        }
        Map<Long, LogicCardAttempt> lastAttempts = new HashMap<>();
        attemptRepository.findByTaskIdInOrderByAttemptedAtAsc(dayTaskIds)
                .forEach(a -> lastAttempts.put(a.getTask().getId(), a));
        List<LogicCardAdminDto> cards = dayCards.stream()
                .sorted(Comparator.comparingInt(c -> LogicDifficulty.valueOf(c.getFinalLevel()).ordinal()))
                .map(c -> LogicCardAdminDto.of(c, tasksByCard.get(c.getId()), lastAttempts))
                .toList();
        return new LogicCardAdminDayDto(cards, (int) doneToday, DAILY_LIMIT);
    }

    /** Перегенерировать все задачи карточки (пока она не начата). */
    @Transactional
    public LogicCardAdminDto regenerateCard(Long parentId, Long cardId) {
        LogicCard card = editableCard(parentId, cardId);
        LogicDifficulty level = LogicDifficulty.valueOf(card.getFinalLevel());
        taskRepository.deleteAll(taskRepository.findByCardIdOrderByIdAsc(cardId));
        List<LogicCardTask> tasks = buildTasks(card.getChild().getId(), card, parentId, level);
        card.setTaskCount(tasks.size());
        card.setTaskTypes(String.join(",", taskTypeSet(tasks)));
        card.setXpReward(level.getSuccessReward());
        cardRepository.save(card);
        taskRepository.saveAll(tasks);
        return LogicCardAdminDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId));
    }

    /** Перегенерировать одну задачу карточки (пока она не начата). */
    @Transactional
    public LogicCardAdminDto regenerateTask(Long parentId, Long taskId) {
        LogicCardTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Задача не найдена"));
        LogicCard card = task.getCard();
        editableCard(parentId, card.getId());
        if (LogicDifficulty.valueOf(card.getFinalLevel()) == LogicDifficulty.OLYMPIAD) {
            throw new BadRequestException("Задачи олимпиадной карточки берутся из шаблона");
        }
        LogicDifficulty level = LogicDifficulty.valueOf(card.getFinalLevel());
        Set<String> texts = new LinkedHashSet<>(taskRepository.findByCardIdOrderByIdAsc(card.getId())
                .stream().map(LogicCardTask::getText).toList());
        texts.remove(task.getText());
        LogicCardGenerator.GeneratedTask fresh = null;
        for (int guard = 0; guard < 40; guard++) {
            LogicCardGenerator.GeneratedTask candidate = generator.generate(task.getTopicCode(), level);
            if (!texts.contains(candidate.text())) {
                fresh = candidate;
                break;
            }
        }
        if (fresh == null) {
            throw new BadRequestException("Не удалось придумать уникальную задачу — попробуйте ещё раз");
        }
        // Обновляем задачу на месте — порядок и идентификаторы остальных задач не меняются
        task.setTaskType(fresh.taskType());
        task.setText(fresh.text());
        task.setAnswer(fresh.answer());
        taskRepository.save(task);
        List<LogicCardTask> all = taskRepository.findByCardIdOrderByIdAsc(card.getId());
        card.setTaskTypes(String.join(",", taskTypeSet(all)));
        cardRepository.save(card);
        return LogicCardAdminDto.of(card, all);
    }

    /** Дневной план: карточка каждой сложности (кроме «Работы над ошибками»). Недостающие — генерируются. */
    private void ensureDayPlan(Child child, Long parentId, LocalDate today) {
        Long childId = child.getId();
        for (LogicDifficulty level : LogicDifficulty.values()) {
            if (level == LogicDifficulty.REVIEW) {
                continue;
            }
            boolean exists = cardRepository
                    .findFirstByChildIdAndCardDateAndFinalLevelOrderByIdDesc(childId, today, level.name())
                    .isPresent();
            if (exists) {
                continue;
            }
            LogicCard card = buildCard(child, parentId, today, level);
            List<LogicCardTask> tasks = buildTasks(childId, card, parentId, level);
            card.setTaskCount(tasks.size());
            card.setTaskTypes(String.join(",", taskTypeSet(tasks)));
            card.setXpReward(level.getSuccessReward());
            card.setStatus("CREATED");
            cardRepository.save(card);
            taskRepository.saveAll(tasks);
        }
    }

    /**
     * После 3/3 завершённых карточек дня создаёт «Работу над ошибками»:
     * копии задач, на которые были неверные ответы (по последней попытке).
     * Без таймера и наград; ребёнок берёт её без запроса родителю.
     */
    private void maybeCreateReviewCard(Long childId, Long parentId, LocalDate today) {
        long finished = cardRepository.countByChildIdAndCardDateAndFinalLevelNotAndStatusIn(
                childId, today, "REVIEW", List.of("SUCCESS", "FAILED"));
        if (finished < DAILY_LIMIT) {
            return;
        }
        if (cardRepository.findFirstByChildIdAndCardDateAndFinalLevelOrderByIdDesc(childId, today, "REVIEW").isPresent()) {
            return;
        }
        // Неверные задачи дня: последняя попытка по каждой задаче обычных карточек
        List<LogicCard> dayCards = cardRepository.findByChildIdAndCardDateOrderByCreatedAtDesc(childId, today).stream()
                .filter(c -> !"REVIEW".equals(c.getFinalLevel()))
                .toList();
        List<Long> taskIds = new ArrayList<>();
        Map<Long, LogicCardTask> tasksById = new HashMap<>();
        for (LogicCard card : dayCards) {
            for (LogicCardTask task : taskRepository.findByCardIdOrderByIdAsc(card.getId())) {
                taskIds.add(task.getId());
                tasksById.put(task.getId(), task);
            }
        }
        Map<Long, LogicCardAttempt> lastAttempts = new HashMap<>();
        attemptRepository.findByTaskIdInOrderByAttemptedAtAsc(taskIds)
                .forEach(a -> lastAttempts.put(a.getTask().getId(), a));
        List<LogicCardTask> wrong = taskIds.stream()
                .map(tasksById::get)
                .filter(t -> {
                    LogicCardAttempt a = lastAttempts.get(t.getId());
                    return a != null && !a.isCorrect();
                })
                .toList();
        if (wrong.isEmpty()) {
            return;
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        LogicCard review = buildCard(child, parentId, today, LogicDifficulty.REVIEW);
        review.setDescription("Повтори задачи, где были ошибки");
        List<LogicCardTask> tasks = wrong.stream().map(t -> {
            LogicCardTask copy = new LogicCardTask();
            copy.setCard(review);
            copy.setTopicCode(t.getTopicCode());
            copy.setTaskType(t.getTaskType());
            copy.setText(t.getText());
            copy.setAnswer(t.getAnswer());
            return copy;
        }).toList();
        review.setTaskCount(tasks.size());
        review.setTaskTypes(String.join(",", taskTypeSet(tasks)));
        review.setXpReward(0);
        // Берётся сразу, без запроса родителю; без таймера (minutes = 0)
        review.setStatus("APPROVED");
        cardRepository.save(review);
        taskRepository.saveAll(tasks);
    }

    /** Карточка, доступная для перегенерации: родительская и ещё не начатая ребёнком. */
    private LogicCard editableCard(Long parentId, Long cardId) {
        LogicCard card = ownedByParent(parentId, cardId);
        if (!"CREATED".equals(card.getStatus()) && !"REQUESTED".equals(card.getStatus())) {
            throw new BadRequestException("Перегенерировать можно только не начатую карточку");
        }
        return card;
    }

    // ---------- Внутренняя логика ----------

    private boolean includeTasks(LogicCard card) {
        return "IN_PROGRESS".equals(card.getStatus())
                || "SUCCESS".equals(card.getStatus())
                || "FAILED".equals(card.getStatus());
    }

    /**
     * Дейлик «Логика»: points = число завершённых карточек дня (мишень 3),
     * full clear (3 карточки) даёт бонус +2 XP как у прочих дейликов (стрик удваивает до 4).
     */
    private void syncDailyLogic(Long childId, LocalDate day) {
        long finished = cardRepository.countByChildIdAndCardDateAndFinalLevelNotAndStatusIn(
                childId, day, "REVIEW", List.of("SUCCESS", "FAILED"));
        DailyLog log = dailyLogRepository.findByChildIdAndSkillAndDay(childId, "LOGIC", day)
                .orElseGet(() -> {
                    DailyLog created = new DailyLog();
                    created.setChild(childRepository.findById(childId)
                            .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
                    created.setSkill("LOGIC");
                    created.setDay(day);
                    created.setCreatedAt(Instant.now());
                    return created;
                });
        StringBuilder done = new StringBuilder();
        for (int i = 0; i < finished; i++) {
            if (i > 0) {
                done.append(',');
            }
            done.append(i);
        }
        log.setPayload("{\"done\":\"" + done + "\"}");
        log.setPoints(BigDecimal.valueOf(finished));
        boolean fullClear = finished >= DAILY_LIMIT;
        log.setFullClear(fullClear);
        if (fullClear) {
            // За стрик успешно решённых карточек опыт за дейлик удваивается (2 → 4 XP)
            log.setXp(correctStreak(childId, day) >= 2 ? 4 : 2);
        } else {
            log.setXp(0);
        }
        dailyLogRepository.save(log);
    }

    /** Сколько дней подряд (заканчивая сегодня) ребёнок успешно решал карточку. */
    private long correctStreak(Long childId, LocalDate day) {
        Set<LocalDate> set = new java.util.HashSet<>(cardRepository.findSuccessDates(childId));
        LocalDate cursor = day;
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

    /** «IQ-коины» = XP логики 1:1 в баланс магазина «Логика». */
    private void creditIqCoins(Long childId, Long parentId, long amount) {
        if (amount <= 0) {
            return;
        }
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "LOGIC").orElse(null);
        if (store != null) {
            balanceService.credit(childId, store.getId(), BigDecimal.valueOf(amount));
        }
    }

    /** Просроченные IN_PROGRESS-карточки завершаются как «не сдано» (0%, без XP). */
    private void expireOverdue(Long childId) {
        Instant now = Instant.now();
        LocalDate today = todayDate();
        for (LogicCard card : cardRepository.findByChildIdAndCardDateAndStatus(childId, today, "IN_PROGRESS")) {
            if (card.getDeadline() != null && card.getDeadline().isBefore(now)) {
                card.setStatus("FAILED");
                card.setResultPercent(0);
                card.setXpEarned(0);
                card.setSubmittedAt(null);
                cardRepository.save(card);
            }
        }
    }

    private LogicCard ownedCard(Long childId, Long cardId) {
        LogicCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!card.getChild().getId().equals(childId)) {
            throw new NotFoundException("Карточка не найдена");
        }
        return card;
    }

    private LogicCard ownedByParent(Long parentId, Long cardId) {
        LogicCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!card.getChild().getParent().getId().equals(parentId)) {
            throw new NotFoundException("Карточка не найдена");
        }
        return card;
    }

    private LogicDifficulty resolveFinal(Long childId, Long parentId, String choice) {
        String c = choice == null ? "MEDIUM" : choice.trim().toUpperCase();
        if ("REVIEW".equals(c)) {
            throw new BadRequestException("Карточка «Работа над ошибками» появляется автоматически");
        }
        try {
            LogicDifficulty.valueOf(c);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Неизвестный выбор уровня: " + choice);
        }
        return LogicDifficulty.resolve(baseLevel(parentId), c);
    }

    private LogicDifficulty baseLevel(Long parentId) {
        int best = 0;
        boolean found = false;
        for (LogicTopicSettings s : settingsRepository.findByParentId(parentId)) {
            if (!s.isActive()) {
                continue;
            }
            found = true;
            LogicDifficulty d = LogicDifficulty.valueOf(s.getBaseDifficulty());
            if (d.ordinal() > best) {
                best = d.ordinal();
            }
        }
        return found ? LogicDifficulty.values()[best] : LogicDifficulty.MEDIUM;
    }

    private List<LogicTopic> activeTopics(Long parentId) {
        List<LogicTopic> out = new ArrayList<>();
        for (LogicTopicSettings s : settingsRepository.findByParentId(parentId)) {
            if (s.isActive()) {
                out.add(s.getTopic());
            }
        }
        return out;
    }

    private LogicCard buildCard(Child child, Long parentId, LocalDate today, LogicDifficulty finalLevel) {
        List<LogicTopic> topics = activeTopics(parentId);
        String description = topics.isEmpty()
                ? finalLevel.getLabel() + " карточка"
                : "Сегодня тренируем: " + topics.stream().map(LogicTopic::getName).reduce((a, b) -> a + ", " + b).orElse("");
        LogicCard card = new LogicCard();
        card.setChild(child);
        card.setCardDate(today);
        card.setFinalLevel(finalLevel.name());
        card.setLabel(finalLevel.getLabel());
        card.setDescription(description);
        card.setMinutes(finalLevel.getMinutes());
        card.setCreatedAt(Instant.now());
        return card;
    }

    private List<LogicCardTask> buildTasks(Long childId, LogicCard card, Long parentId, LogicDifficulty level) {
        if (level == LogicDifficulty.OLYMPIAD) {
            LogicOlympiadCard template = generator.pickOlympiadTemplate();
            card.setDescription(template.getTitle());
            card.setMinutes(template.getMinutes());
            return generator.olympiadTasks(template.getId()).stream()
                    .map(g -> toTask(card, g)).toList();
        }

        int count = TASK_COUNT[level.ordinal()];
        List<LogicTopic> topics = activeTopics(parentId);
        if (topics.isEmpty()) {
            topics = topicRepository.findAllByOrderBySortOrderAsc().subList(0, 2);
        }

        Set<String> recent = recentTexts(childId);
        List<LogicCardTask> tasks = new ArrayList<>();
        int guard = 0;
        while (tasks.size() < count && guard < count * 20) {
            LogicTopic topic = topics.get(guard % topics.size());
            LogicCardGenerator.GeneratedTask g = generator.generate(topic.getCode(), level);
            if (recent.contains(g.text()) && guard < count * 15) {
                guard++;
                continue;
            }
            recent.add(g.text());
            tasks.add(toTask(card, g));
            guard++;
        }
        return tasks;
    }

    private LogicCardTask toTask(LogicCard card, LogicCardGenerator.GeneratedTask g) {
        LogicCardTask task = new LogicCardTask();
        task.setCard(card);
        task.setTopicCode(g.topicCode());
        task.setTaskType(g.taskType());
        task.setText(g.text());
        task.setAnswer(g.answer());
        return task;
    }

    private Set<String> recentTexts(Long childId) {
        LocalDate since = todayDate().minusDays(30);
        List<LogicCard> cards = cardRepository.findByChildIdAndCardDateGreaterThanEqualOrderByCardDateDesc(childId, since);
        List<Long> ids = cards.stream().map(LogicCard::getId).toList();
        Set<String> out = new LinkedHashSet<>();
        if (!ids.isEmpty()) {
            taskRepository.findByCardIdIn(ids).forEach(t -> out.add(t.getText()));
        }
        return out;
    }

    private Set<String> taskTypeSet(List<LogicCardTask> tasks) {
        Set<String> out = new LinkedHashSet<>();
        tasks.forEach(t -> out.add(t.getTaskType()));
        return out;
    }

    /** Логическая дата карточного дня: сдвиг в 9:00 (как в лимитах и математике). */
    private static LocalDate todayDate() {
        ZonedDateTime msk = ZonedDateTime.now(ZONE);
        ZonedDateTime dayStart = msk.toLocalDate().atTime(9, 0).atZone(ZONE);
        return msk.isBefore(dayStart) ? msk.toLocalDate().minusDays(1) : msk.toLocalDate();
    }

    private static String normalize(String s) {
        if (s == null) {
            return "";
        }
        return s.trim().replace(',', '.').replaceAll("\\s+", "").toLowerCase();
    }

    private static LogicDifficulty parseBase(String value) {
        try {
            LogicDifficulty d = LogicDifficulty.valueOf(value);
            if (d == LogicDifficulty.EXTREME || d == LogicDifficulty.OLYMPIAD) {
                throw new BadRequestException("Базовый уровень не может быть «Хард» или «Олимпиада»");
            }
            return d;
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Недопустимый уровень сложности: " + value);
        }
    }

    /** Сид олимпиадных шаблонов логики (идемпотентно). */
    private void seedOlympiadTemplates() {
        if (olympiadRepository.count() > 0) {
            return;
        }
        createOlympiadTemplate("Олимпиада · Логика 1-2 класс", "1-2 класс",
                List.of(
                        t("RIDDLE", "У Маши было 3 яблока, 2 половинки и 4 четвертинки. Сколько всего яблок у Маши?", "5"),
                        t("RIDDLE", "Сколько концов у трёх с половиной палок?", "8"),
                        t("ODD", "Найди лишнее: круг, квадрат, треугольник, куб", "куб"),
                        t("RIDDLE", "Термометр показывает 5 градусов. Сколько градусов покажут два таких термометра?", "5")));
        createOlympiadTemplate("Олимпиада · Логика 3-4 класс", "3-4 класс",
                List.of(
                        t("RIDDLE", "Полтора судака стоят полтора рубля. Сколько рублей стоят 5 судаков?", "5"),
                        t("RIDDLE", "Одно яйцо варится 4 минуты. Сколько минут варятся 5 яиц?", "4"),
                        t("RIDDLE", "Книга стоит 100 рублей и ещё полкниги. Сколько стоит книга?", "200"),
                        t("RIDDLE", "На берёзе росло 8 яблок. Ветер сдул 3. Сколько яблок осталось на берёзе?", "0")));
        createOlympiadTemplate("Олимпиада · Логика 5-6 класс", "5-6 класс",
                List.of(
                        t("RIDDLE", "Сколько раз цифра 7 встречается в числах от 1 до 100?", "20"),
                        t("RIDDLE", "Один кирпич весит килограмм и ещё полкирпича. Сколько килограммов весит кирпич?", "2"),
                        t("PATTERN", "Продолжи ряд: 1, 11, 21, 1211, 111221, ?", "312211"),
                        t("RIDDLE", "Двое играли в шахматы 2 часа. Сколько часов играл каждый?", "2")));
        createOlympiadTemplate("Олимпиада · Логика 7-8 класс", "7-8 класс",
                List.of(
                        t("RIDDLE", "Сумма трёх последовательных чётных чисел равна 42. Найди наибольшее из них", "16"),
                        t("RIDDLE", "Сколько диагоналей у восьмиугольника?", "20"),
                        t("RIDDLE", "Возраст дедушки выражается наименьшим трёхзначным числом, записанным разными цифрами. Сколько лет дедушке?", "102"),
                        t("RIDDLE", "Петя сказал: «Позавчера мне было 10 лет, а в следующем году исполнится 13». Какое число его день рождения?", "31")));
    }

    private record TemplateParts(String type, String text, String answer) {
    }

    private TemplateParts t(String type, String text, String answer) {
        return new TemplateParts(type, text, answer);
    }

    private void createOlympiadTemplate(String title, String grade, List<TemplateParts> parts) {
        LogicOlympiadCard card = new LogicOlympiadCard();
        card.setTitle(title);
        card.setGradeLabel(grade);
        card.setMinutes(60);
        card = olympiadRepository.save(card);
        List<LogicOlympiadTask> tasks = new ArrayList<>();
        for (TemplateParts p : parts) {
            LogicOlympiadTask task = new LogicOlympiadTask();
            task.setCard(card);
            task.setTaskType(p.type());
            task.setText(p.text());
            task.setAnswer(p.answer());
            tasks.add(task);
        }
        olympiadTaskRepository.saveAll(tasks);
    }
}
