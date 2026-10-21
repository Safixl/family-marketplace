package com.familymarket.mathcard;

import com.familymarket.achievement.AchievementService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.MathCardApprovalDto;
import com.familymarket.dto.MathCardDayDto;
import com.familymarket.dto.MathCardDto;
import com.familymarket.dto.MathCardSubmitResult;
import com.familymarket.dto.MathTopicDto;
import com.familymarket.dto.MathTopicSettingsItemRequest;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Микросервис динамической генерации математических карточек.
 * Жизненный цикл карточки: CREATED → REQUESTED (запрос родителю) → APPROVED →
 * IN_PROGRESS (единый серверный таймер) → SUCCESS/FAILED (проверка одним сабмитом).
 * XP в навык «Математика»: за каждый верный пример (по уровню 1..10) + награда за
 * карточку ≥80% (при 100% удваивается).
 */
@Service
public class MathCardService {

    private static final int TASK_COUNT[] = {8, 10, 12, 14, 16, 0}; // EASY..OLYMPIAD (0 — из шаблона)
    private static final int SUCCESS_PERCENT = 80;
    private static final int DAILY_LIMIT = 3;
    /** День стартует в 9:00 (МСК) — как в лимитах и карточках заданий. */
    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    private final MathTopicRepository topicRepository;
    private final MathTopicSettingsRepository settingsRepository;
    private final MathCardRepository cardRepository;
    private final MathCardTaskRepository taskRepository;
    private final MathCardAttemptRepository attemptRepository;
    private final MathOlympiadRepository olympiadRepository;
    private final MathOlympiadTaskRepository olympiadTaskRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final MathCardGenerator generator;
    private final AchievementService achievementService;

    public MathCardService(MathTopicRepository topicRepository,
                           MathTopicSettingsRepository settingsRepository,
                           MathCardRepository cardRepository,
                           MathCardTaskRepository taskRepository,
                           MathCardAttemptRepository attemptRepository,
                           MathOlympiadRepository olympiadRepository,
                           MathOlympiadTaskRepository olympiadTaskRepository,
                           ChildRepository childRepository,
                           UserRepository userRepository,
                           MathCardGenerator generator,
                           AchievementService achievementService) {
        this.topicRepository = topicRepository;
        this.settingsRepository = settingsRepository;
        this.cardRepository = cardRepository;
        this.taskRepository = taskRepository;
        this.attemptRepository = attemptRepository;
        this.olympiadRepository = olympiadRepository;
        this.olympiadTaskRepository = olympiadTaskRepository;
        this.childRepository = childRepository;
        this.userRepository = userRepository;
        this.generator = generator;
        this.achievementService = achievementService;
    }

    // ---------- Темы и настройки родителя ----------

    @Transactional
    public void ensureTopics(Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        for (MathTopic topic : topicRepository.findAllByOrderBySortOrderAsc()) {
            if (settingsRepository.findByParentIdAndTopicId(parentId, topic.getId()).isEmpty()) {
                MathTopicSettings settings = new MathTopicSettings();
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
    public List<MathTopicDto> parentSettings(Long parentId) {
        ensureTopics(parentId);
        List<MathTopic> topics = topicRepository.findAllByOrderBySortOrderAsc();
        List<MathTopicSettings> settings = settingsRepository.findByParentId(parentId);
        return topics.stream()
                .map(t -> MathTopicDto.of(t, settings.stream()
                        .filter(s -> s.getTopic().getId().equals(t.getId()))
                        .findFirst().orElse(null)))
                .toList();
    }

    @Transactional
    public List<MathTopicDto> updateSettings(Long parentId, List<MathTopicSettingsItemRequest> items) {
        ensureTopics(parentId);
        List<MathTopicSettings> existing = settingsRepository.findByParentId(parentId);
        for (MathTopicSettingsItemRequest item : items) {
            MathTopicSettings settings = existing.stream()
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
    public MathCardDayDto listToday(Long childId) {
        expireOverdue(childId);
        LocalDate today = todayDate();
        long doneToday = cardRepository.countByChildIdAndCardDateAndStatusIn(
                childId, today, List.of("SUCCESS", "FAILED"));
        if (doneToday >= DAILY_LIMIT) {
            return new MathCardDayDto(List.of(), (int) doneToday, DAILY_LIMIT);
        }
        List<MathCardDto> cards = cardRepository.findByChildIdAndCardDateOrderByCreatedAtDesc(childId, today).stream()
                .sorted(Comparator.comparingInt(c -> MathDifficulty.valueOf(c.getFinalLevel()).ordinal()))
                .map(c -> MathCardDto.of(c, taskRepository.findByCardIdOrderByIdAsc(c.getId()), includeTasks(c)))
                .toList();
        return new MathCardDayDto(cards, (int) doneToday, DAILY_LIMIT);
    }

    @Transactional
    public MathCardDto generate(Long childId, String choice) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Long parentId = child.getParent().getId();
        ensureTopics(parentId);
        expireOverdue(childId);

        LocalDate today = todayDate();
        long doneToday = cardRepository.countByChildIdAndCardDateAndStatusIn(
                childId, today, List.of("SUCCESS", "FAILED"));
        if (doneToday >= DAILY_LIMIT) {
            throw new BadRequestException("Лимит карточек на день исчерпан (3). Новые появятся завтра в 9:00");
        }
        // Пока карточка решается — другие не создаём, отдаём активную
        List<MathCard> active = cardRepository.findByChildIdAndCardDateAndStatus(childId, today, "IN_PROGRESS");
        if (!active.isEmpty()) {
            MathCard inProgress = active.get(0);
            return MathCardDto.of(inProgress, taskRepository.findByCardIdOrderByIdAsc(inProgress.getId()), true);
        }

        MathDifficulty finalLevel = resolveFinal(childId, parentId, choice);
        MathCard existing = cardRepository
                .findFirstByChildIdAndCardDateAndFinalLevelOrderByIdDesc(childId, today, finalLevel.name())
                .orElse(null);
        if (existing != null) {
            return MathCardDto.of(existing, taskRepository.findByCardIdOrderByIdAsc(existing.getId()), includeTasks(existing));
        }

        MathCard card = buildCard(child, parentId, today, finalLevel);
        List<MathCardTask> tasks = buildTasks(childId, card, parentId, finalLevel);
        card.setTaskCount(tasks.size());
        card.setTaskTypes(String.join(",", taskTypeSet(tasks)));
        card.setXpReward(finalLevel.getSuccessReward());
        card.setStatus("CREATED");
        cardRepository.save(card);
        taskRepository.saveAll(tasks);
        return MathCardDto.of(card, tasks, false);
    }

    // ---------- Жизненный цикл (ребёнок) ----------

    /** «Взять задачу» — запрос родителю на одобрение. */
    @Transactional
    public MathCardDto request(Long childId, Long cardId) {
        MathCard card = ownedCard(childId, cardId);
        if (!"CREATED".equals(card.getStatus())) {
            throw new BadRequestException("Карточка уже взята");
        }
        card.setStatus("REQUESTED");
        cardRepository.save(card);
        return MathCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), false);
    }

    /** Отзыв запроса (повторное нажатие «Ожидает одобрения»). */
    @Transactional
    public MathCardDto revoke(Long childId, Long cardId) {
        MathCard card = ownedCard(childId, cardId);
        if (!"REQUESTED".equals(card.getStatus())) {
            throw new BadRequestException("Отозвать можно только ожидающий одобрения запрос");
        }
        card.setStatus("CREATED");
        cardRepository.save(card);
        return MathCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), false);
    }

    /** «Начать задачу» — старт единого серверного таймера. */
    @Transactional
    public MathCardDto start(Long childId, Long cardId) {
        MathCard card = ownedCard(childId, cardId);
        if (!"APPROVED".equals(card.getStatus())) {
            throw new BadRequestException("Карточка ещё не одобрена родителем");
        }
        if (!cardRepository.findByChildIdAndCardDateAndStatus(childId, card.getCardDate(), "IN_PROGRESS").isEmpty()) {
            throw new BadRequestException("Сначала завершите текущую карточку");
        }
        Instant now = Instant.now();
        card.setStatus("IN_PROGRESS");
        card.setStartedAt(now);
        card.setDeadline(now.plusSeconds(card.getMinutes() * 60L));
        cardRepository.save(card);
        return MathCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), true);
    }

    /** Отправка на проверку (одной кнопкой): проверка всех ответов, начисление XP. */
    @Transactional
    public MathCardSubmitResult submit(Long childId, Long cardId, List<String> answers) {
        MathCard card = ownedCard(childId, cardId);
        expireOverdue(childId);
        if (!"IN_PROGRESS".equals(card.getStatus())) {
            throw new BadRequestException("Карточка не в работе");
        }
        List<MathCardTask> tasks = taskRepository.findByCardIdOrderByIdAsc(cardId);
        MathDifficulty level = MathDifficulty.valueOf(card.getFinalLevel());

        List<String> list = answers == null ? List.of() : answers;
        int correct = 0;
        for (int i = 0; i < tasks.size(); i++) {
            String given = i < list.size() ? list.get(i) : "";
            boolean ok = normalize(tasks.get(i).getAnswer()).equals(normalize(given));
            if (ok) {
                correct++;
            }
            MathCardAttempt attempt = new MathCardAttempt();
            attempt.setTask(tasks.get(i));
            attempt.setAnswer(given == null ? "" : given.trim());
            attempt.setCorrect(ok);
            attempt.setAttemptedAt(Instant.now());
            attemptRepository.save(attempt);
        }

        int percent = tasks.isEmpty() ? 0 : (int) Math.round(correct * 100.0 / tasks.size());
        boolean success = percent >= SUCCESS_PERCENT;
        int perExampleXp = correct * level.getPerExampleXp();
        int successReward = success ? level.getSuccessReward() * (percent == 100 ? 2 : 1) : 0;
        int xpEarned = perExampleXp + successReward;

        card.setStatus(success ? "SUCCESS" : "FAILED");
        card.setResultPercent(percent);
        card.setSubmittedAt(Instant.now());
        card.setXpEarned(xpEarned);
        cardRepository.save(card);
        // Авто-начисление достижений по математике (примеры, карточки, стрики)
        achievementService.checkProgress(childId);
        return new MathCardSubmitResult(percent, success, correct, tasks.size(), perExampleXp, successReward, xpEarned);
    }

    // ---------- Одобрение родителем ----------

    @Transactional(readOnly = true)
    public List<MathCardApprovalDto> parentApprovals(Long parentId) {
        return cardRepository.findByParentRequested(parentId).stream()
                .map(MathCardApprovalDto::of)
                .toList();
    }

    @Transactional
    public void approve(Long parentId, Long cardId) {
        MathCard card = ownedByParent(parentId, cardId);
        if (!"REQUESTED".equals(card.getStatus())) {
            throw new BadRequestException("Запроса на одобрение нет");
        }
        card.setStatus("APPROVED");
        cardRepository.save(card);
    }

    @Transactional
    public void reject(Long parentId, Long cardId) {
        MathCard card = ownedByParent(parentId, cardId);
        if (!"REQUESTED".equals(card.getStatus())) {
            throw new BadRequestException("Запроса на одобрение нет");
        }
        card.setStatus("CREATED");
        cardRepository.save(card);
    }

    // ---------- Внутренняя логика ----------

    private boolean includeTasks(MathCard card) {
        return "IN_PROGRESS".equals(card.getStatus())
                || "SUCCESS".equals(card.getStatus())
                || "FAILED".equals(card.getStatus());
    }

    /** Просроченные IN_PROGRESS-карточки завершаются как «не сдано» (0%, без XP). */
    private void expireOverdue(Long childId) {
        Instant now = Instant.now();
        LocalDate today = todayDate();
        for (MathCard card : cardRepository.findByChildIdAndCardDateAndStatus(childId, today, "IN_PROGRESS")) {
            if (card.getDeadline() != null && card.getDeadline().isBefore(now)) {
                card.setStatus("FAILED");
                card.setResultPercent(0);
                card.setXpEarned(0);
                card.setSubmittedAt(null);
                cardRepository.save(card);
            }
        }
    }

    private MathCard ownedCard(Long childId, Long cardId) {
        MathCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!card.getChild().getId().equals(childId)) {
            throw new NotFoundException("Карточка не найдена");
        }
        return card;
    }

    private MathCard ownedByParent(Long parentId, Long cardId) {
        MathCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!card.getChild().getParent().getId().equals(parentId)) {
            throw new NotFoundException("Карточка не найдена");
        }
        return card;
    }

    private MathDifficulty resolveFinal(Long childId, Long parentId, String choice) {
        String c = choice == null ? "MEDIUM" : choice.trim().toUpperCase();
        try {
            MathDifficulty.valueOf(c);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Неизвестный выбор уровня: " + choice);
        }
        return MathDifficulty.resolve(baseLevel(parentId), c);
    }

    private MathDifficulty baseLevel(Long parentId) {
        int best = 0;
        boolean found = false;
        for (MathTopicSettings s : settingsRepository.findByParentId(parentId)) {
            if (!s.isActive()) {
                continue;
            }
            found = true;
            MathDifficulty d = MathDifficulty.valueOf(s.getBaseDifficulty());
            if (d.ordinal() > best) {
                best = d.ordinal();
            }
        }
        return found ? MathDifficulty.values()[best] : MathDifficulty.MEDIUM;
    }

    private List<MathTopic> activeTopics(Long parentId) {
        List<MathTopic> out = new ArrayList<>();
        for (MathTopicSettings s : settingsRepository.findByParentId(parentId)) {
            if (s.isActive()) {
                out.add(s.getTopic());
            }
        }
        return out;
    }

    private MathCard buildCard(Child child, Long parentId, LocalDate today, MathDifficulty finalLevel) {
        List<MathTopic> topics = activeTopics(parentId);
        String description = topics.isEmpty()
                ? finalLevel.getLabel() + " карточка"
                : "Сегодня тренируем: " + topics.stream().map(MathTopic::getName).reduce((a, b) -> a + ", " + b).orElse("");
        MathCard card = new MathCard();
        card.setChild(child);
        card.setCardDate(today);
        card.setFinalLevel(finalLevel.name());
        card.setLabel(finalLevel.getLabel());
        card.setDescription(description);
        card.setMinutes(finalLevel.getMinutes());
        card.setCreatedAt(Instant.now());
        return card;
    }

    private List<MathCardTask> buildTasks(Long childId, MathCard card, Long parentId, MathDifficulty level) {
        if (level == MathDifficulty.OLYMPIAD) {
            MathOlympiadCard template = generator.pickOlympiadTemplate();
            card.setDescription(template.getTitle());
            card.setMinutes(template.getMinutes());
            return generator.olympiadTasks(template.getId()).stream()
                    .map(g -> toTask(card, g)).toList();
        }

        int count = TASK_COUNT[level.ordinal()];
        List<MathTopic> topics = activeTopics(parentId);
        if (topics.isEmpty()) {
            topics = topicRepository.findAllByOrderBySortOrderAsc().subList(0, 2);
        }

        Set<String> recent = recentTexts(childId);
        List<MathCardTask> tasks = new ArrayList<>();
        int guard = 0;
        while (tasks.size() < count && guard < count * 20) {
            MathTopic topic = topics.get(guard % topics.size());
            MathCardGenerator.GeneratedTask g = generator.generate(topic.getCode(), level);
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

    private MathCardTask toTask(MathCard card, MathCardGenerator.GeneratedTask g) {
        MathCardTask task = new MathCardTask();
        task.setCard(card);
        task.setTopicCode(g.topicCode());
        task.setTaskType(g.taskType());
        task.setText(g.text());
        task.setAnswer(g.answer());
        return task;
    }

    private Set<String> recentTexts(Long childId) {
        LocalDate since = todayDate().minusDays(30);
        List<MathCard> cards = cardRepository.findByChildIdAndCardDateGreaterThanEqualOrderByCardDateDesc(childId, since);
        List<Long> ids = cards.stream().map(MathCard::getId).toList();
        Set<String> out = new LinkedHashSet<>();
        if (!ids.isEmpty()) {
            taskRepository.findByCardIdIn(ids).forEach(t -> out.add(t.getText()));
        }
        return out;
    }

    private Set<String> taskTypeSet(List<MathCardTask> tasks) {
        Set<String> out = new LinkedHashSet<>();
        tasks.forEach(t -> out.add(t.getTaskType()));
        return out;
    }

    /** Логическая дата карточного дня: сдвиг в 9:00 (как в лимитах и карточках заданий). */
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

    private static MathDifficulty parseBase(String value) {
        try {
            MathDifficulty d = MathDifficulty.valueOf(value);
            if (d == MathDifficulty.EXTREME || d == MathDifficulty.OLYMPIAD) {
                throw new BadRequestException("Базовый уровень не может быть «Хард» или «Олимпиада»");
            }
            return d;
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Недопустимый уровень сложности: " + value);
        }
    }

    /** Сид олимпиадных шаблонов (идемпотентно). */
    private void seedOlympiadTemplates() {
        if (olympiadRepository.count() > 0) {
            return;
        }
        createOlympiadTemplate("Олимпиада · 3 класс", "3 класс",
                List.of(
                        t("TEXT", "В корзине 7 яблок и 3 груши. Сколько всего фруктов в корзине?", "10"),
                        t("CALC", "12 + 18 − 15", "15"),
                        t("EQUATION", "x + 6 = 14", "8"),
                        t("TEXT", "У Маши 18 конфет, у Пети — в 2 раза меньше. Сколько конфет у Пети?", "9")));
        createOlympiadTemplate("Олимпиада · 4 класс", "4 класс",
                List.of(
                        t("CALC", "48 ÷ 6 × 3", "24"),
                        t("EQUATION", "x · 7 = 56", "8"),
                        t("TEXT", "Поезд проехал 240 км за 3 часа. С какой скоростью он ехал?", "80"),
                        t("CALC", "100 − 7 × 9", "37")));
        createOlympiadTemplate("Олимпиада · 5-6 класс", "5-6 класс",
                List.of(
                        t("FRACTIONS", "2/3 + 4/3 = ?", "2"),
                        t("CALC", "0,5 × 0,4", "0,2"),
                        t("EQUATION", "3x − 7 = 14", "7"),
                        t("TEXT", "Сумма трёх последовательных чисел равна 33. Найди их", "10,11,12")));
        createOlympiadTemplate("Олимпиада · 7-8 класс", "7-8 класс",
                List.of(
                        t("CALC", "√144 + 5²", "37"),
                        t("EQUATION", "2(x + 3) = 18", "6"),
                        t("NEGATIVE", "(−7) + 12 − 3", "2"),
                        t("TEXT", "Катеты прямоугольного треугольника 6 и 8. Найди гипотенузу", "10")));
    }

    private record TemplateParts(String type, String text, String answer) {
    }

    private TemplateParts t(String type, String text, String answer) {
        return new TemplateParts(type, text, answer);
    }

    private void createOlympiadTemplate(String title, String grade, List<TemplateParts> parts) {
        MathOlympiadCard card = new MathOlympiadCard();
        card.setTitle(title);
        card.setGradeLabel(grade);
        card.setMinutes(60);
        card = olympiadRepository.save(card);
        List<MathOlympiadTask> tasks = new ArrayList<>();
        for (TemplateParts p : parts) {
            MathOlympiadTask task = new MathOlympiadTask();
            task.setCard(card);
            task.setTaskType(p.type());
            task.setText(p.text());
            task.setAnswer(p.answer());
            tasks.add(task);
        }
        olympiadTaskRepository.saveAll(tasks);
    }
}