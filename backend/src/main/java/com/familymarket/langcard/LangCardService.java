package com.familymarket.langcard;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.daily.DailyLog;
import com.familymarket.daily.DailyLogRepository;
import com.familymarket.dto.LangCardDayDto;
import com.familymarket.dto.LangCardDto;
import com.familymarket.dto.LangCardReviewDto;
import com.familymarket.dto.LangCardSettingItemRequest;
import com.familymarket.dto.LangCardSubmitResult;
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
import java.util.List;
import java.util.Map;

/**
 * Микросервис карточек иностранного языка: 6 видов заданий вместо уровней сложности.
 * Авто-задания (Стена слов, Тайные истории, А оно точно так пишется) проверяются автоматически;
 * ручные (Расшифруй послание, Поделись секретом, Покажи своё мастерство) уходят родителю,
 * который выставляет множитель 0/1/2, умножающий все награды за задание.
 * Слово считается изученным после 50 верных ответов подряд; одновременно можно изучать не
 * более 50 слов — следующее слово активируется автоматически по списку важности.
 */
@Service
public class LangCardService {

    private static final int DAILY_LIMIT = 3;
    private static final int SUCCESS_PERCENT = 80;
    private static final int LEARNED_STREAK = 50;
    private static final int MAX_ACTIVE_WORDS = 50;
    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    private final LangWordRepository wordRepository;
    private final LangWordProgressRepository progressRepository;
    private final LangCardSettingRepository settingRepository;
    private final LangCardRepository cardRepository;
    private final LangCardTaskRepository taskRepository;
    private final LangCardAttemptRepository attemptRepository;
    private final DailyLogRepository dailyLogRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final LangTaskGenerator generator;
    private final AchievementService achievementService;
    private final StoreRepository storeRepository;
    private final BalanceService balanceService;

    public LangCardService(LangWordRepository wordRepository,
                           LangWordProgressRepository progressRepository,
                           LangCardSettingRepository settingRepository,
                           LangCardRepository cardRepository,
                           LangCardTaskRepository taskRepository,
                           LangCardAttemptRepository attemptRepository,
                           DailyLogRepository dailyLogRepository,
                           ChildRepository childRepository,
                           UserRepository userRepository,
                           LangTaskGenerator generator,
                           AchievementService achievementService,
                           StoreRepository storeRepository,
                           BalanceService balanceService) {
        this.wordRepository = wordRepository;
        this.progressRepository = progressRepository;
        this.settingRepository = settingRepository;
        this.cardRepository = cardRepository;
        this.taskRepository = taskRepository;
        this.attemptRepository = attemptRepository;
        this.dailyLogRepository = dailyLogRepository;
        this.childRepository = childRepository;
        this.userRepository = userRepository;
        this.generator = generator;
        this.achievementService = achievementService;
        this.storeRepository = storeRepository;
        this.balanceService = balanceService;
    }

    // ---------- Настройки родителя ----------

    @Transactional
    public List<LangCardSetting> ensureSettings(Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        List<LangCardSetting> existing = settingRepository.findByParentId(parentId);
        for (LangTaskType type : LangTaskType.values()) {
            if (existing.stream().noneMatch(s -> s.getTaskType() == type)) {
                LangCardSetting setting = new LangCardSetting();
                setting.setParent(parent);
                setting.setTaskType(type);
                setting.setMinutes(type.getDefaultMinutes());
                setting.setDifficulty(LangDifficulty.EASY);
                settingRepository.save(setting);
            }
        }
        return settingRepository.findByParentId(parentId);
    }

    @Transactional
    public List<LangCardSetting> updateSettings(Long parentId, List<LangCardSettingItemRequest> items) {
        ensureSettings(parentId);
        for (LangCardSettingItemRequest item : items) {
            LangTaskType type = LangTaskType.parse(item.taskType());
            LangCardSetting setting = settingRepository.findByParentIdAndTaskType(parentId, type)
                    .orElseThrow(() -> new NotFoundException("Настройка не найдена"));
            if (item.minutes() != null && item.minutes() > 0) {
                setting.setMinutes(Math.min(item.minutes(), 120));
            }
            if (item.difficulty() != null) {
                setting.setDifficulty(LangDifficulty.parse(item.difficulty()));
            }
            settingRepository.save(setting);
        }
        return settingRepository.findByParentId(parentId);
    }

    // ---------- Словарь ----------

    /** Авто-активация первого слова, если у ребёнка ещё ничего не активировано. */
    @Transactional
    public void ensureDictionary(Long childId) {
        if (progressRepository.countActiveByChildId(childId) > 0) {
            return;
        }
        wordRepository.findNextUnactivated(childId).ifPresent(w -> activateWord(childId, w));
    }

    private void activateWord(Long childId, LangWord word) {
        LangWordProgress p = new LangWordProgress();
        p.setChild(childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
        p.setWord(word);
        p.setStatus(LangWordProgress.Status.ACTIVE);
        p.setActivatedAt(Instant.now());
        progressRepository.save(p);
    }

    /** Активировать слово вручную (родитель) — не более 50 активных одновременно. */
    @Transactional
    public void activateByParent(Long parentId, Long childId, Long wordId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (!child.getParent().getId().equals(parentId)) {
            throw new NotFoundException("Ребенок не найден");
        }
        LangWord word = wordRepository.findById(wordId)
                .orElseThrow(() -> new NotFoundException("Слово не найдено"));
        var existing = progressRepository.findByChildIdAndWordId(childId, wordId);
        if (existing.isPresent()) {
            if (existing.get().getStatus() == LangWordProgress.Status.ACTIVE) {
                throw new BadRequestException("Слово уже изучается");
            }
            throw new BadRequestException("Слово уже изучено");
        }
        if (progressRepository.countActiveByChildId(childId) >= MAX_ACTIVE_WORDS) {
            throw new BadRequestException("Нельзя изучать более " + MAX_ACTIVE_WORDS
                    + " слов одновременно — сначала изучи текущие");
        }
        activateWord(childId, word);
    }

    /** Родитель вручную отмечает слово изученным. */
    @Transactional
    public void markLearnedByParent(Long parentId, Long childId, Long wordId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (!child.getParent().getId().equals(parentId)) {
            throw new NotFoundException("Ребенок не найден");
        }
        LangWordProgress p = progressRepository.findByChildIdAndWordId(childId, wordId)
                .orElseThrow(() -> new NotFoundException("Слово не активировано"));
        learnWord(childId, p);
    }

    /** Перевод слова в статус «изучил» + авто-активация следующего слова по списку. */
    private void learnWord(Long childId, LangWordProgress p) {
        p.setStatus(LangWordProgress.Status.LEARNED);
        p.setLearnedAt(Instant.now());
        progressRepository.save(p);
        autoActivateNext(childId);
    }

    private void autoActivateNext(Long childId) {
        if (progressRepository.countActiveByChildId(childId) >= MAX_ACTIVE_WORDS) {
            return;
        }
        wordRepository.findNextUnactivated(childId).ifPresent(w -> activateWord(childId, w));
    }

    /** Словарь ребёнка: активные и изученные слова. */
    @Transactional(readOnly = true)
    public List<VocabWord> childVocab(Long childId) {
        List<LangWordProgress> all = progressRepository.findByChildIdOrderByStatusAscIdAsc(childId);
        List<VocabWord> out = new ArrayList<>();
        for (LangWordProgress p : all) {
            out.add(new VocabWord(
                    p.getWord().getId(),
                    p.getWord().getForeignText(),
                    p.getWord().getRuText(),
                    p.getStatus().name(),
                    p.getCorrectStreak(),
                    LEARNED_STREAK));
        }
        return out;
    }

    public record VocabWord(Long wordId, String foreign, String ru, String status, int streak, int streakTarget) {
    }

    /** Полный словарь для родителя: все слова + статус для конкретного ребёнка. */
    @Transactional(readOnly = true)
    public List<ParentVocabWord> parentVocab(Long parentId, Long childId) {
        List<LangWord> words = wordRepository.findAllByOrderBySortOrderAsc();
        List<LangWordProgress> progress = progressRepository.findByChildIdOrderByStatusAscIdAsc(childId);
        List<ParentVocabWord> out = new ArrayList<>();
        for (LangWord w : words) {
            var p = progress.stream().filter(x -> x.getWord().getId().equals(w.getId())).findFirst().orElse(null);
            out.add(new ParentVocabWord(
                    w.getId(),
                    w.getForeignText(),
                    w.getRuText(),
                    w.getDifficultyLevel(),
                    w.getSortOrder(),
                    p == null ? "NONE" : p.getStatus().name(),
                    p == null ? 0 : p.getCorrectStreak(),
                    LEARNED_STREAK));
        }
        return out;
    }

    public record ParentVocabWord(Long wordId, String foreign, String ru, int level, int sortOrder,
                                  String status, int streak, int streakTarget) {
    }

    // ---------- Карточки: просмотр и генерация ----------

    /** Карточки дня + счётчик решённых (лимит 3 в день, сброс в 9:00). */
    @Transactional
    public LangCardDayDto listToday(Long childId) {
        expireOverdue(childId);
        LocalDate today = todayDate();
        long doneToday = cardRepository.countByChildIdAndCardDateAndStatusIn(
                childId, today, List.of("SUCCESS", "FAILED"));
        List<LangCard> dayCards = cardRepository.findByChildIdAndCardDateOrderByCreatedAtDesc(childId, today);
        if (doneToday >= DAILY_LIMIT) {
            dayCards = dayCards.stream().filter(c -> "SUCCESS".equals(c.getStatus()) || "FAILED".equals(c.getStatus())).toList();
        }
        List<LangCardDto> cards = dayCards.stream()
                .map(c -> LangCardDto.of(c, taskRepository.findByCardIdOrderByIdAsc(c.getId()), includeTasks(c)))
                .toList();
        return new LangCardDayDto(cards, (int) doneToday, DAILY_LIMIT);
    }

    @Transactional
    public LangCardDto generate(Long childId, String taskType) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Long parentId = child.getParent().getId();
        LangTaskType type = LangTaskType.parse(taskType);
        ensureSettings(parentId);
        ensureDictionary(childId);
        expireOverdue(childId);

        LocalDate today = todayDate();
        // Лимит по ВСЕМ карточкам дня (включая незавершённые): нельзя перегенерировать
        long doneToday = cardRepository.countByChildIdAndCardDate(childId, today);
        if (doneToday >= DAILY_LIMIT) {
            throw new BadRequestException("Лимит карточек на день исчерпан (3). Новые появятся завтра в 9:00");
        }
        List<LangCard> active = cardRepository.findByChildIdAndCardDateAndStatus(childId, today, "IN_PROGRESS");
        if (!active.isEmpty()) {
            LangCard inProgress = active.get(0);
            return LangCardDto.of(inProgress, taskRepository.findByCardIdOrderByIdAsc(inProgress.getId()), true);
        }

        LangCardSetting setting = settingRepository.findByParentIdAndTaskType(parentId, type)
                .orElseThrow(() -> new NotFoundException("Настройка вида задания не найдена"));
        LangDifficulty difficulty = setting.getDifficulty();

        // Активные слова ребёнка, отфильтрованные по диапазону сложности родителя
        List<LangWord> words = activeWordsForDifficulty(childId, difficulty);
        if (words.isEmpty()) {
            // Если в диапазоне сложности нет слов — берём все активные
            words = activeWords(childId);
        }

        LangCard card = new LangCard();
        card.setChild(child);
        card.setCardDate(today);
        card.setTaskType(type);
        card.setMinutes(setting.getMinutes());
        card.setDifficulty(difficulty);
        card.setCreatedAt(Instant.now());
        List<LangCardTask> tasks = buildTasks(card, type, words, difficulty);

        int base = type.isManual()
                ? 10 * difficulty.getPerTaskXp()          // ручные: 10/20/30 × множитель
                : difficulty.getSuccessReward();          // авто: 5/10/15 за успех ≥80%
        card.setBaseReward(base);
        card.setStatus("CREATED");
        cardRepository.save(card);
        taskRepository.saveAll(tasks);
        return LangCardDto.of(card, tasks, false);
    }

    // ---------- Жизненный цикл (ребёнок) ----------

    /** «Начать» — для авто- и ручных заданий одобрение родителя не требуется. */
    @Transactional
    public LangCardDto start(Long childId, Long cardId) {
        LangCard card = ownedCard(childId, cardId);
        if (!"CREATED".equals(card.getStatus())) {
            throw new BadRequestException("Карточка уже начата или завершена");
        }
        if (!cardRepository.findByChildIdAndCardDateAndStatus(childId, card.getCardDate(), "IN_PROGRESS").isEmpty()) {
            throw new BadRequestException("Сначала завершите текущую карточку");
        }
        Instant now = Instant.now();
        card.setStatus("IN_PROGRESS");
        card.setStartedAt(now);
        card.setDeadline(now.plusSeconds(card.getMinutes() * 60L));
        cardRepository.save(card);
        return LangCardDto.of(card, taskRepository.findByCardIdOrderByIdAsc(cardId), true);
    }

    /**
     * Сдача карточки. Авто-задания проверяются сразу (порог 80%).
     * Ручные задания уходят родителю на проверку (статус REVIEW, множитель 0/1/2).
     */
    @Transactional
    public LangCardSubmitResult submit(Long childId, Long cardId, List<String> answers) {
        LangCard card = ownedCard(childId, cardId);
        expireOverdue(childId);
        if (!"IN_PROGRESS".equals(card.getStatus())) {
            throw new BadRequestException("Карточка не в работе");
        }
        List<LangCardTask> tasks = taskRepository.findByCardIdOrderByIdAsc(cardId);

        if (card.getTaskType().isManual()) {
            // Ручное задание: ответ уходит родителю на проверку с множителем
            card.setStatus("REVIEW");
            card.setSubmittedAt(Instant.now());
            cardRepository.save(card);
            saveAttemptText(tasks, answers);
            return new LangCardSubmitResult(0, false, 0, tasks.size(), 0, 0, 0, true);
        }

        LangDifficulty difficulty = card.getDifficulty();
        List<String> list = answers == null ? List.of() : answers;
        int correct = 0;
        for (int i = 0; i < tasks.size(); i++) {
            String given = i < list.size() ? list.get(i) : "";
            boolean ok = checkAnswer(tasks.get(i), given, childId);
            if (ok) {
                correct++;
            }
            LangCardAttempt attempt = new LangCardAttempt();
            attempt.setTask(tasks.get(i));
            attempt.setAnswer(given == null ? "" : given.trim());
            attempt.setCorrect(ok);
            attempt.setAttemptedAt(Instant.now());
            attemptRepository.save(attempt);
        }

        int percent = tasks.isEmpty() ? 0 : (int) Math.round(correct * 100.0 / tasks.size());
        boolean success = percent >= SUCCESS_PERCENT;
        int perTaskXp = correct * difficulty.getPerTaskXp();
        int successReward = success ? difficulty.getSuccessReward() : 0;
        int xpEarned = perTaskXp + successReward;

        card.setStatus(success ? "SUCCESS" : "FAILED");
        card.setResultPercent(percent);
        card.setSubmittedAt(Instant.now());
        card.setXpEarned(xpEarned);
        card.setMultiplier(1);
        cardRepository.save(card);
        creditLingvoMiles(childId, card.getChild().getParent().getId(), xpEarned);
        syncDailyLang(childId, card.getCardDate());
        achievementService.checkProgress(childId);
        return new LangCardSubmitResult(percent, success, correct, tasks.size(), perTaskXp, successReward, xpEarned, false);
    }

    /** Проверка ответа авто-задачи + обновление серии слова. */
    private boolean checkAnswer(LangCardTask task, String given, Long childId) {
        String normalized = normalize(given);
        boolean ok;
        if (task.getTaskType() == LangTaskType.SECRET_STORIES) {
            // Двойная ячейка: "иностранное|русское"
            String[] parts = task.getAnswer().split("\\|", 2);
            String en = parts.length > 0 ? parts[0] : "";
            String ru = parts.length > 1 ? parts[1] : "";
            String[] givenParts = given == null ? new String[]{""} : given.split("\\|", 2);
            String givenEn = givenParts.length > 0 ? givenParts[0] : "";
            String givenRu = givenParts.length > 1 ? givenParts[1] : "";
            ok = normalize(en).equals(normalize(givenEn)) && normalize(ru).equals(normalize(givenRu));
        } else {
            ok = normalize(task.getAnswer()).equals(normalized);
        }
        // Серия верных ответов по слову (50 подряд = изучил)
        if (task.getWordId() != null) {
            var p = progressRepository.findByChildIdAndWordId(childId, task.getWordId()).orElse(null);
            if (p != null && p.getStatus() == LangWordProgress.Status.ACTIVE) {
                p.setTotalAttempts(p.getTotalAttempts() + 1);
                if (ok) {
                    p.setCorrectStreak(p.getCorrectStreak() + 1);
                    p.setTotalCorrect(p.getTotalCorrect() + 1);
                    if (p.getCorrectStreak() >= LEARNED_STREAK) {
                        learnWord(childId, p);
                    } else {
                        progressRepository.save(p);
                    }
                } else {
                    p.setCorrectStreak(0);
                    progressRepository.save(p);
                }
            }
        }
        return ok;
    }

    private void saveAttemptText(List<LangCardTask> tasks, List<String> answers) {
        List<String> list = answers == null ? List.of() : answers;
        for (int i = 0; i < tasks.size(); i++) {
            String given = i < list.size() ? list.get(i) : "";
            LangCardAttempt attempt = new LangCardAttempt();
            attempt.setTask(tasks.get(i));
            attempt.setAnswer(given == null ? "" : given.trim());
            attempt.setCorrect(false);
            attempt.setAttemptedAt(Instant.now());
            attemptRepository.save(attempt);
        }
    }

    // ---------- Проверка ручных заданий родителем ----------

    @Transactional(readOnly = true)
    public List<LangCardReviewDto> parentReviews(Long parentId) {
        List<LangCard> cards = cardRepository.findByParentReview(parentId);
        Map<Long, List<LangCardTask>> tasksByCard = new HashMap<>();
        List<Long> allTaskIds = new ArrayList<>();
        for (LangCard c : cards) {
            List<LangCardTask> tasks = taskRepository.findByCardIdOrderByIdAsc(c.getId());
            tasksByCard.put(c.getId(), tasks);
            tasks.forEach(t -> allTaskIds.add(t.getId()));
        }
        // Последняя попытка по задаче — ответ ребёнка
        Map<Long, LangCardAttempt> lastAttemptByTask = new HashMap<>();
        if (!allTaskIds.isEmpty()) {
            for (LangCardAttempt a : attemptRepository.findByTaskIdIn(allTaskIds)) {
                lastAttemptByTask.merge(a.getTask().getId(), a,
                        (oldA, newA) -> newA.getAttemptedAt().isAfter(oldA.getAttemptedAt()) ? newA : oldA);
            }
        }
        List<LangCardReviewDto> out = new ArrayList<>();
        for (LangCard c : cards) {
            List<LangCardTask> tasks = tasksByCard.get(c.getId());
            List<String> childAnswers = tasks.stream()
                    .map(t -> lastAttemptByTask.get(t.getId()))
                    .map(a -> a == null ? "" : a.getAnswer())
                    .toList();
            out.add(LangCardReviewDto.of(c, tasks, childAnswers));
        }
        return out;
    }

    /** Родитель оценивает ручное задание: множитель 0 — отклонить, 1 — зачесть, 2 — зачесть ×2. */
    @Transactional
    public void review(Long parentId, Long cardId, int multiplier, String comment) {
        LangCard card = cardRepository.findById(cardId)
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
        card.setResultPercent(multiplier > 0 ? 100 : 0);
        if (comment != null && !comment.isBlank()) {
            card.setParentComment(comment.trim());
        }
        cardRepository.save(card);
        if (xpEarned > 0) {
            creditLingvoMiles(card.getChild().getId(), parentId, xpEarned);
            syncDailyLang(card.getChild().getId(), card.getCardDate());
            achievementService.checkProgress(card.getChild().getId());
        }
    }

    // ---------- Внутренняя логика ----------

    private boolean includeTasks(LangCard card) {
        return "IN_PROGRESS".equals(card.getStatus())
                || "REVIEW".equals(card.getStatus())
                || "SUCCESS".equals(card.getStatus())
                || "FAILED".equals(card.getStatus());
    }

    private List<LangCardTask> buildTasks(LangCard card, LangTaskType type, List<LangWord> words, LangDifficulty difficulty) {
        List<LangTaskGenerator.GeneratedTask> generated = type.isManual()
                ? generator.manualTasks(type, words)
                : generator.autoTasks(type, words, difficulty);
        List<LangCardTask> tasks = new ArrayList<>();
        for (LangTaskGenerator.GeneratedTask g : generated) {
            LangCardTask task = new LangCardTask();
            task.setCard(card);
            task.setTaskType(g.taskType());
            task.setText(g.text());
            task.setAnswer(g.answer());
            task.setWordId(g.wordId());
            tasks.add(task);
        }
        return tasks;
    }

    /** Активные слова ребёнка в диапазоне сложности. */
    private List<LangWord> activeWordsForDifficulty(Long childId, LangDifficulty difficulty) {
        List<LangWord> active = activeWords(childId);
        List<LangWord> filtered = active.stream()
                .filter(w -> w.getDifficultyLevel() >= difficulty.getMinWordLevel()
                        && w.getDifficultyLevel() <= difficulty.getMaxWordLevel())
                .toList();
        return filtered.isEmpty() ? active : filtered;
    }

    private List<LangWord> activeWords(Long childId) {
        List<LangWordProgress> active = progressRepository.findByChildIdAndStatus(childId, LangWordProgress.Status.ACTIVE);
        List<LangWord> out = new ArrayList<>();
        for (LangWordProgress p : active) {
            out.add(p.getWord());
        }
        out.sort(Comparator.comparingInt(LangWord::getSortOrder));
        return out;
    }

    /**
     * Дейлик «Язык»: points = число завершённых карточек дня (мишень 3),
     * full clear (3 карточки) даёт бонус +2 XP как у прочих дейликов.
     */
    private void syncDailyLang(Long childId, LocalDate day) {
        long finished = cardRepository.countByChildIdAndCardDateAndStatusIn(
                childId, day, List.of("SUCCESS", "FAILED"));
        DailyLog log = dailyLogRepository.findByChildIdAndSkillAndDay(childId, "LANG", day)
                .orElseGet(() -> {
                    DailyLog created = new DailyLog();
                    created.setChild(childRepository.findById(childId)
                            .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
                    created.setSkill("LANG");
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
        log.setXp(fullClear ? 2 : 0);
        dailyLogRepository.save(log);
    }

    /** «Лингво-мили» = XP языка 1:1 в баланс магазина «Язык». */
    private void creditLingvoMiles(Long childId, Long parentId, long amount) {
        if (amount <= 0) {
            return;
        }
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "LANG").orElse(null);
        if (store != null) {
            balanceService.credit(childId, store.getId(), BigDecimal.valueOf(amount));
        }
    }

    /** Просроченные IN_PROGRESS-карточки завершаются как «не сдано» (0%, без XP). */
    private void expireOverdue(Long childId) {
        Instant now = Instant.now();
        LocalDate today = todayDate();
        for (LangCard card : cardRepository.findByChildIdAndCardDateAndStatus(childId, today, "IN_PROGRESS")) {
            if (card.getDeadline() != null && card.getDeadline().isBefore(now)) {
                card.setStatus("FAILED");
                card.setResultPercent(0);
                card.setXpEarned(0);
                card.setSubmittedAt(null);
                cardRepository.save(card);
            }
        }
    }

    private LangCard ownedCard(Long childId, Long cardId) {
        LangCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Карточка не найдена"));
        if (!card.getChild().getId().equals(childId)) {
            throw new NotFoundException("Карточка не найдена");
        }
        return card;
    }

    private static LocalDate todayDate() {
        ZonedDateTime msk = ZonedDateTime.now(ZONE);
        ZonedDateTime dayStart = msk.toLocalDate().atTime(9, 0).atZone(ZONE);
        return msk.isBefore(dayStart) ? msk.toLocalDate().minusDays(1) : msk.toLocalDate();
    }

    private static String normalize(String s) {
        if (s == null) {
            return "";
        }
        return s.trim().replace(',', '.').replaceAll("\\s+", " ").toLowerCase();
    }
}
