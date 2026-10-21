package com.familymarket.mathcard;

import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.MathCardAnswerResult;
import com.familymarket.dto.MathCardDto;
import com.familymarket.dto.MathTopicDto;
import com.familymarket.dto.MathTopicSettingsItemRequest;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Микросервис динамической генерации математических карточек.
 * Настройки тем и базовой сложности — у родителя; финальный уровень — по пересечению
 * выбора ребёнка и базового уровня родителя (см. {@link MathDifficulty#resolve}).
 */
@Service
public class MathCardService {

    /** Число задач по финальному уровню (динамические карточки). */
    private static final int[] TASK_COUNT = {8, 10, 12, 14, 16, 0}; // EASY..OLYMPIAD (0 — берём из шаблона)

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

    public MathCardService(MathTopicRepository topicRepository,
                           MathTopicSettingsRepository settingsRepository,
                           MathCardRepository cardRepository,
                           MathCardTaskRepository taskRepository,
                           MathCardAttemptRepository attemptRepository,
                           MathOlympiadRepository olympiadRepository,
                           MathOlympiadTaskRepository olympiadTaskRepository,
                           ChildRepository childRepository,
                           UserRepository userRepository,
                           MathCardGenerator generator) {
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
    }

    // ---------- Темы и настройки родителя ----------

    /** Создаёт настройки по умолчанию (тема активна, базовая сложность Средний), если их нет. */
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

    /** Настройки тем для панели родителя (тумблеры + матрица базовой сложности). */
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

    /** Сохранение тумблеров тем и базовой сложности (потолок базового уровня — «Сложный»). */
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
                MathDifficulty diff = parseBase(item.baseDifficulty());
                settings.setBaseDifficulty(diff.name());
            }
            settingsRepository.save(settings);
        }
        return parentSettings(parentId);
    }

    // ---------- Генерация и работа с карточками ----------

    /** Сегодняшняя карточка ребёнка (последняя созданная за день) или null. */
    @Transactional(readOnly = true)
    public MathCardDto today(Long childId) {
        MathCard card = cardRepository.findFirstByChildIdAndCardDateOrderByIdDesc(childId, LocalDate.now()).orElse(null);
        return card == null ? null : MathCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(card.getId()));
    }

    /** Генерация карточки по выбору ребёнка; повторный запрос того же уровня возвращает ту же карточку дня. */
    @Transactional
    public MathCardDto generate(Long childId, String choice) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Long parentId = child.getParent().getId();
        ensureTopics(parentId);

        LocalDate today = LocalDate.now();
        MathDifficulty finalLevel = resolveFinal(childId, parentId, choice);

        // Одна карточка в день для этого уровня — не плодим дубли
        MathCard existing = cardRepository
                .findFirstByChildIdAndCardDateAndFinalLevelOrderByIdDesc(childId, today, finalLevel.name())
                .orElse(null);
        if (existing != null) {
            return MathCardDto.of(existing, taskRepository.findByCardIdOrderByIdAsc(existing.getId()));
        }

        MathCard card = buildCard(child, parentId, today, finalLevel);
        List<MathCardTask> tasks = buildTasks(childId, card, parentId, finalLevel);
        card.setTaskCount(tasks.size());
        card.setTaskTypes(String.join(",", taskTypeSet(tasks)));
        cardRepository.save(card);
        taskRepository.saveAll(tasks);
        return MathCardDto.of(card, tasks);
    }

    /** Проверка ответа на задачу карточки (история сохраняется). */
    @Transactional
    public MathCardAnswerResult answer(Long childId, Long taskId, String answer) {
        MathCardTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Задача не найдена"));
        if (!task.getCard().getChild().getId().equals(childId)) {
            throw new NotFoundException("Задача не найдена");
        }
        boolean correct = normalize(task.getAnswer()).equals(normalize(answer));
        MathCardAttempt attempt = new MathCardAttempt();
        attempt.setTask(task);
        attempt.setAnswer(answer == null ? "" : answer.trim());
        attempt.setCorrect(correct);
        attempt.setAttemptedAt(Instant.now());
        attemptRepository.save(attempt);
        return new MathCardAnswerResult(correct, task.getAnswer());
    }

    // ---------- Внутренняя логика ----------

    private MathDifficulty resolveFinal(Long childId, Long parentId, String choice) {
        String c = choice == null ? "MEDIUM" : choice.trim().toUpperCase();
        try {
            MathDifficulty.valueOf(c);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Неизвестный выбор уровня: " + choice);
        }
        // Базовый уровень карточки — максимальный базовый уровень активных тем родителя
        MathDifficulty base = baseLevel(parentId);
        return MathDifficulty.resolve(base, c);
    }

    private MathDifficulty baseLevel(Long parentId) {
        int best = 0; // EASY
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

        // Анти-дубль: тексты задач ребёнка за последние 30 дней
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
        LocalDate since = LocalDate.now().minusDays(30);
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

    /** Сид олимпиадных шаблонов (идемпотентно, при первом обращении). */
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