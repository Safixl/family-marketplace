package com.familymarket.daily;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.DailyAnswerRequest;
import com.familymarket.dto.DailySkillDto;
import com.familymarket.dto.DailyStateDto;
import com.familymarket.dto.DailyTaskDto;
import com.familymarket.dto.LangLearnRequest;
import com.familymarket.dto.LangWordDto;
import com.familymarket.dto.SportLogRequest;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Автоматические дейлики (базовый доход) по 4 навыкам:
 * ЛОГИКА: 3-5 мини-задач под возраст, 1 правильный ответ = 1 IQ-коин, Full Clear = +2 XP.
 * ЯЗЫК: карточки слов, 1 выученное слово = 1 лингво-миля.
 * СПОРТ: 10 минут активности = 1 очко ИЛИ 2000 шагов = 1 очко.
 * МАТЕМАТИКА: ежедневные примеры под возраст, 1 верный ответ = 1 балл.
 * Задания детерминированы на день (seed = childId + дата), ответы хранятся только на сервере.
 */
@Service
public class DailyService {

    private static final String[] LANG_EASY = {
            "cat:кот", "dog:собака", "sun:солнце", "apple:яблоко", "house:дом",
            "tree:дерево", "water:вода", "milk:молоко", "red:красный", "blue:синий",
            "book:книга", "pen:ручка", "ball:мяч", "bird:птица", "fish:рыба",
            "moon:луна", "star:звезда", "car:машина", "train:поезд", "snow:снег"
    };
    private static final String[] LANG_MEDIUM = {
            "beautiful:красивый", "knowledge:знание", "journey:путешествие", "courage:храбрость",
            "whisper:шёпот", "mountain:гора", "freedom:свобода", "shadow:тень",
            "garden:сад", "wander:бродить", "remember:помнить", "curious:любопытный",
            "silent:молчаливый", "brave:смелый", "clever:умный", "promise:обещание",
            "mystery:тайна", "treasure:сокровище", "adventure:приключение", "wisdom:мудрость"
    };

    private record LogicPuzzle(String question, List<String> answers, int minAge) {
    }

    private static final List<LogicPuzzle> LOGIC_POOL = List.of(
            new LogicPuzzle("Что тяжелее: килограмм пуха или килограмм железа?",
                    List.of("одинаково", "поровну", "равно", "неважно", "1", "одинаковы"), 5),
            new LogicPuzzle("У мамы 3 сына, и у каждого есть одна сестра. Сколько всего детей у мамы?",
                    List.of("4"), 5),
            new LogicPuzzle("Найди лишнее: яблоко, груша, морковь, слива.",
                    List.of("морковь"), 5),
            new LogicPuzzle("Сколько ног у паука?",
                    List.of("8"), 5),
            new LogicPuzzle("Что лишнее: солнце, луна, звезда, машина?",
                    List.of("машина"), 5),
            new LogicPuzzle("Сколько углов останется у квадратного стола, если один угол отпилить?",
                    List.of("5"), 8),
            new LogicPuzzle("Продолжи ряд: 2, 4, 8, 16, ?",
                    List.of("32"), 8),
            new LogicPuzzle("Что идёт, но не бежит?",
                    List.of("время", "часы"), 8),
            new LogicPuzzle("Сколько месяцев в году имеют 28 дней?",
                    List.of("12"), 8),
            new LogicPuzzle("Раздели 30 на половину и прибавь 10. Сколько получится?",
                    List.of("70"), 8),
            new LogicPuzzle("Продолжи ряд Фибоначчи: 1, 1, 2, 3, 5, 8, ?",
                    List.of("13"), 11),
            new LogicPuzzle("Три курицы за 3 дня несут 3 яйца. Сколько яиц снесут 9 куриц за 9 дней?",
                    List.of("27"), 11),
            new LogicPuzzle("Какое число следующее: 1, 11, 21, 1211, ?",
                    List.of("111221"), 13),
            new LogicPuzzle("В комнате 4 угла. В каждом углу — кошка. Напротив каждой кошки — 3 кошки. Сколько кошек в комнате?",
                    List.of("4"), 11),
            new LogicPuzzle("Сколько раз за сутки часовая и минутная стрелки совпадают?",
                    List.of("22"), 13));

    private final DailyLogRepository dailyLogRepository;
    private final ChildRepository childRepository;
    private final StoreRepository storeRepository;
    private final BalanceService balanceService;
    private final AchievementService achievementService;
    private final ObjectMapper objectMapper;

    public DailyService(DailyLogRepository dailyLogRepository,
                        ChildRepository childRepository,
                        StoreRepository storeRepository,
                        BalanceService balanceService,
                        AchievementService achievementService,
                        ObjectMapper objectMapper) {
        this.dailyLogRepository = dailyLogRepository;
        this.childRepository = childRepository;
        this.storeRepository = storeRepository;
        this.balanceService = balanceService;
        this.achievementService = achievementService;
        this.objectMapper = objectMapper;
    }

    // ---------- Состояние дня ----------

    @Transactional(readOnly = true)
    public DailyStateDto state(Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        LocalDate today = LocalDate.now();
        Long parentId = child.getParent().getId();
        int age = child.getAge() == null ? 7 : child.getAge();

        List<DailySkillDto> skills = new ArrayList<>();
        skills.add(logicState(childId, parentId, age, today));
        skills.add(langState(childId, parentId, age, today));
        skills.add(sportState(childId, parentId, today));
        skills.add(mathState(childId, parentId, age, today));
        skills.removeIf(s -> s.currencyName() == null); // нет магазина — навык не активен
        return new DailyStateDto(today.toString(), skills);
    }

    // ---------- Логика ----------

    @Transactional
    public DailySkillDto answerLogic(Long childId, DailyAnswerRequest request) {
        Child child = getChild(childId);
        LocalDate today = LocalDate.now();
        Store store = storeFor(child, "LOGIC");
        if (store == null) {
            throw new BadRequestException("Магазин логики не настроен");
        }
        int age = child.getAge() == null ? 7 : child.getAge();
        List<LogicPuzzle> puzzles = pickLogic(age, childId, today);
        if (request.taskIndex() == null || request.taskIndex() < 0 || request.taskIndex() >= puzzles.size()) {
            throw new BadRequestException("Задание не найдено");
        }
        LogicPuzzle puzzle = puzzles.get(request.taskIndex().intValue());
        boolean correct = accepts(puzzle.answers(), request.answer());

        Payload payload = loadPayload(childId, "LOGIC", today);
        List<Integer> done = payload.doneIndexes();
        if (correct && !done.contains(request.taskIndex().intValue())) {
            done.add(request.taskIndex().intValue());
        }
        payload.done = done.stream().map(String::valueOf).collect(Collectors.joining(","));
        saveAndSettle(childId, "LOGIC", today, store, payload, done.size(), puzzles.size());
        return logicState(childId, child.getParent().getId(), age, today);
    }

    // ---------- Язык ----------

    @Transactional
    public DailySkillDto learnLang(Long childId, LangLearnRequest request) {
        Child child = getChild(childId);
        LocalDate today = LocalDate.now();
        Store store = storeFor(child, "LANG");
        if (store == null) {
            throw new BadRequestException("Магазин языка не настроен");
        }
        int age = child.getAge() == null ? 7 : child.getAge();
        List<String> words = pickWords(age, childId, today).stream().map(w -> w.split(":")[0]).toList();
        if (request.wordIds() == null || request.wordIds().isEmpty()) {
            throw new BadRequestException("Не выбрано ни одного слова");
        }

        Payload payload = loadPayload(childId, "LANG", today);
        List<String> learned = new ArrayList<>(payload.learnedWords());
        for (String wordId : request.wordIds()) {
            if (words.contains(wordId) && !learned.contains(wordId)) {
                learned.add(wordId);
            }
        }
        payload.learned = String.join(",", learned);
        saveAndSettle(childId, "LANG", today, store, payload, learned.size(), words.size());
        return langState(childId, child.getParent().getId(), age, today);
    }

    // ---------- Спорт ----------

    @Transactional
    public DailySkillDto logSport(Long childId, SportLogRequest request) {
        Child child = getChild(childId);
        LocalDate today = LocalDate.now();
        Store store = storeFor(child, "SPORT");
        if (store == null) {
            throw new BadRequestException("Магазин спорта не настроен");
        }
        int minutes = request.minutes() == null ? 0 : Math.max(0, request.minutes());
        int steps = request.steps() == null ? 0 : Math.max(0, request.steps());
        if (minutes == 0 && steps == 0) {
            throw new BadRequestException("Укажи минуты активности или количество шагов");
        }

        Payload payload = loadPayload(childId, "SPORT", today);
        payload.minutes = payload.minutes + minutes;
        payload.steps = payload.steps + steps;
        long points = sportPoints(payload.minutes, payload.steps);
        long target = 5;
        saveAndSettle(childId, "SPORT", today, store, payload, points, target);
        return sportState(childId, child.getParent().getId(), today);
    }

    // ---------- Математика ----------

    @Transactional
    public DailySkillDto answerMath(Long childId, DailyAnswerRequest request) {
        Child child = getChild(childId);
        LocalDate today = LocalDate.now();
        Store store = storeFor(child, "MATH");
        if (store == null) {
            throw new BadRequestException("Магазин математики не настроен");
        }
        int age = child.getAge() == null ? 7 : child.getAge();
        List<String[]> tasks = pickMath(age, childId, today);
        if (request.taskIndex() == null || request.taskIndex() < 0 || request.taskIndex() >= tasks.size()) {
            throw new BadRequestException("Задание не найдено");
        }
        boolean correct = request.answer() != null
                && request.answer().trim().equalsIgnoreCase(tasks.get(request.taskIndex().intValue())[1]);

        Payload payload = loadPayload(childId, "MATH", today);
        List<Integer> done = payload.doneIndexes();
        if (correct && !done.contains(request.taskIndex().intValue())) {
            done.add(request.taskIndex().intValue());
        }
        payload.done = done.stream().map(String::valueOf).collect(Collectors.joining(","));
        saveAndSettle(childId, "MATH", today, store, payload, done.size(), tasks.size());
        return mathState(childId, child.getParent().getId(), age, today);
    }

    // ---------- Общее: сохранение и начисление ----------

    private void saveAndSettle(Long childId, String skill, LocalDate day, Store store,
                               Payload payload, long earned, long target) {
        long points = earned;
        boolean fullClear = target > 0 && earned >= target;
        int xp = (int) points + (fullClear ? 2 : 0);

        DailyLog log = dailyLogRepository.findByChildIdAndSkillAndDay(childId, skill, day)
                .orElseGet(() -> {
                    DailyLog created = new DailyLog();
                    created.setChild(getChild(childId));
                    created.setSkill(skill);
                    created.setDay(day);
                    created.setCreatedAt(Instant.now());
                    return created;
                });
        long prevPoints = log.getPoints() == null ? 0 : log.getPoints().longValue();
        long delta = points - prevPoints;

        log.setPayload(toJson(payload));
        log.setPoints(BigDecimal.valueOf(points));
        log.setXp(xp);
        log.setFullClear(fullClear);
        dailyLogRepository.save(log);

        if (delta > 0) {
            balanceService.credit(childId, store.getId(), BigDecimal.valueOf(delta));
            achievementService.checkProgress(childId);
        }
    }

    // ---------- Состояния навыков ----------

    private DailySkillDto logicState(Long childId, Long parentId, int age, LocalDate day) {
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "LOGIC").orElse(null);
        if (store == null) {
            return disabled("LOGIC");
        }
        List<LogicPuzzle> puzzles = pickLogic(age, childId, day);
        Payload payload = loadPayload(childId, "LOGIC", day);
        List<DailyTaskDto> tasks = new ArrayList<>();
        for (int i = 0; i < puzzles.size(); i++) {
            tasks.add(new DailyTaskDto(i, "logic", puzzles.get(i).question()));
        }
        return skill("LOGIC", "Логика", "🧩", store, tasks, List.of(), 0, 0,
                payload.doneIndexes().size(), puzzles.size(), payload.doneIndexes().size() >= puzzles.size());
    }

    private DailySkillDto langState(Long childId, Long parentId, int age, LocalDate day) {
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "LANG").orElse(null);
        if (store == null) {
            return disabled("LANG");
        }
        List<String> words = pickWords(age, childId, day);
        Payload payload = loadPayload(childId, "LANG", day);
        List<LangWordDto> cards = new ArrayList<>();
        for (String entry : words) {
            String[] parts = entry.split(":");
            cards.add(new LangWordDto(parts[0], parts[0], parts[1], payload.learned.contains(parts[0])));
        }
        return skill("LANG", "Иностранный язык", "🌍", store, List.of(), cards, 0, 0,
                payload.learnedWords().size(), words.size(), payload.learnedWords().size() >= words.size());
    }

    private DailySkillDto sportState(Long childId, Long parentId, LocalDate day) {
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "SPORT").orElse(null);
        if (store == null) {
            return disabled("SPORT");
        }
        Payload payload = loadPayload(childId, "SPORT", day);
        long points = sportPoints(payload.minutes, payload.steps);
        return skill("SPORT", "Спорт и хобби", "⚽", store, List.of(), List.of(),
                payload.minutes, payload.steps, points, 5, points >= 5);
    }

    private DailySkillDto mathState(Long childId, Long parentId, int age, LocalDate day) {
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "MATH").orElse(null);
        if (store == null) {
            return disabled("MATH");
        }
        List<String[]> tasks = pickMath(age, childId, day);
        Payload payload = loadPayload(childId, "MATH", day);
        List<DailyTaskDto> taskDtos = new ArrayList<>();
        for (int i = 0; i < tasks.size(); i++) {
            taskDtos.add(new DailyTaskDto(i, "math", tasks.get(i)[0]));
        }
        return skill("MATH", "Математика", "🧮", store, taskDtos, List.of(), 0, 0,
                payload.doneIndexes().size(), tasks.size(), payload.doneIndexes().size() >= tasks.size());
    }

    private DailySkillDto skill(String skill, String name, String icon, Store store,
                                List<DailyTaskDto> tasks, List<LangWordDto> words,
                                long minutes, long steps, long earned, long target, boolean completed) {
        return new DailySkillDto(skill, name, icon,
                store.getCurrencyName(), store.getCurrencyIcon(),
                tasks, words, minutes, steps, earned, target,
                completed && target > 0, completed);
    }

    private DailySkillDto disabled(String skill) {
        return new DailySkillDto(skill, "", "", null, null, List.of(), List.of(), 0, 0, 0, 0, false, true);
    }

    // ---------- Генерация (детерминированная на день) ----------

    private Random seeded(Long childId, LocalDate day) {
        return new Random(childId * 31L + day.toEpochDay());
    }

    private List<LogicPuzzle> pickLogic(int age, Long childId, LocalDate day) {
        Random rnd = seeded(childId, day);
        List<LogicPuzzle> eligible = LOGIC_POOL.stream()
                .filter(p -> p.minAge() <= age)
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.shuffle(eligible, rnd);
        int count = Math.min(5, Math.max(3, eligible.size()));
        return eligible.subList(0, count);
    }

    private List<String> pickWords(int age, Long childId, LocalDate day) {
        Random rnd = seeded(childId, day);
        String[] pool = age <= 9 ? LANG_EASY : LANG_MEDIUM;
        List<String> words = new ArrayList<>(Arrays.asList(pool));
        Collections.shuffle(words, rnd);
        return words.subList(0, Math.min(5, words.size()));
    }

    private List<String[]> pickMath(int age, Long childId, LocalDate day) {
        Random rnd = seeded(childId, day);
        List<String[]> tasks = new ArrayList<>();
        int count = age <= 9 ? 3 : 4;
        for (int i = 0; i < count; i++) {
            if (age <= 7) {
                int a = 1 + rnd.nextInt(10);
                int b = 1 + rnd.nextInt(10);
                tasks.add(new String[]{"Сколько будет " + a + " + " + b + "?", String.valueOf(a + b)});
                int c = 2 + rnd.nextInt(9);
                int d = 1 + rnd.nextInt(c);
                tasks.add(new String[]{"Сколько будет " + c + " − " + d + "?", String.valueOf(c - d)});
            } else if (age <= 10) {
                int a = 2 + rnd.nextInt(8);
                int b = 2 + rnd.nextInt(8);
                tasks.add(new String[]{"Сколько будет " + a + " × " + b + "?", String.valueOf(a * b)});
                int c = 20 + rnd.nextInt(80);
                int d = 1 + rnd.nextInt(20);
                tasks.add(new String[]{"Сколько будет " + c + " + " + d + "?", String.valueOf(c + d)});
            } else {
                int a = 12 + rnd.nextInt(8);
                int b = 2 + rnd.nextInt(8);
                tasks.add(new String[]{"Сколько будет " + a + " × " + b + "?", String.valueOf(a * b)});
                int prod = a * b;
                tasks.add(new String[]{"Сколько будет " + prod + " ÷ " + b + "?", String.valueOf(a)});
            }
        }
        return tasks.subList(0, Math.min(count, tasks.size()));
    }

    private long sportPoints(long minutes, long steps) {
        return minutes / 10 + steps / 2000;
    }

    // ---------- Payload (JSON в daily_logs) ----------

    private static class Payload {
        String done = "";      // "0,2,3"
        String learned = "";   // "apple,dog"
        long minutes = 0;
        long steps = 0;

        List<Integer> doneIndexes() {
            if (done == null || done.isBlank()) {
                return new ArrayList<>();
            }
            return Arrays.stream(done.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Integer::parseInt)
                    .collect(Collectors.toCollection(ArrayList::new));
        }

        List<String> learnedWords() {
            if (learned == null || learned.isBlank()) {
                return new ArrayList<>();
            }
            return Arrays.stream(learned.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(ArrayList::new));
        }
    }

    private Payload loadPayload(Long childId, String skill, LocalDate day) {
        return dailyLogRepository.findByChildIdAndSkillAndDay(childId, skill, day)
                .map(log -> fromJson(log.getPayload()))
                .orElseGet(Payload::new);
    }

    private String toJson(Payload payload) {
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("done", payload.done);
            map.put("learned", payload.learned);
            map.put("minutes", payload.minutes);
            map.put("steps", payload.steps);
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Payload fromJson(String json) {
        if (json == null || json.isBlank()) {
            return new Payload();
        }
        try {
            Map<String, Object> map = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
            Payload payload = new Payload();
            payload.done = String.valueOf(map.getOrDefault("done", ""));
            payload.learned = String.valueOf(map.getOrDefault("learned", ""));
            payload.minutes = Long.parseLong(String.valueOf(map.getOrDefault("minutes", 0)));
            payload.steps = Long.parseLong(String.valueOf(map.getOrDefault("steps", 0)));
            return payload;
        } catch (Exception e) {
            return new Payload();
        }
    }

    private boolean accepts(List<String> answers, String given) {
        if (given == null || given.isBlank()) {
            return false;
        }
        String trimmed = given.trim().toLowerCase();
        return answers.stream().anyMatch(a -> a.equalsIgnoreCase(trimmed));
    }

    private Store storeFor(Child child, String templateType) {
        return storeRepository.findByParentIdAndTemplateType(child.getParent().getId(), templateType).orElse(null);
    }

    private Child getChild(Long childId) {
        return childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
    }
}
