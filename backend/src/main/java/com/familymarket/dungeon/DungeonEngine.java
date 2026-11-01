package com.familymarket.dungeon;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.function.Supplier;

/**
 * Игровой движок подземелий: генератор пошагового лога.
 * Вся цепочка событий похода рассчитывается наперёд: движения, проверки навыков
 * (Иностранный язык — развилки, Логика — секреты/сундуки/тактика, Спорт — бои),
 * расход выносливости (-5% за вход в комнату и за каждую попытку проверки),
 * исходы: зачистка / поражение (полный сброс) / отдых (продолжение со следующего дня).
 */
@Service
public class DungeonEngine {

    public record SkillLevels(int langLevel, int logicLevel, int sportLevel) {
    }

    /** Контекст одного похода. */
    public record RunContext(
            DungeonCatalog.DungeonDef dungeon,
            SkillLevels skills,
            double gearCoef,
            String heroClass,
            Supplier<EquipmentDef> lootPicker) {
    }

    public record LogEntry(String at, String icon, String text) {
    }

    public enum Outcome {WON, LOST, RESTING}

    private static final int ENTER_COST = 5;   // вход в комнату
    private static final int ATTEMPT_COST = 5; // попытка проверки/боя

    // ---------- Типы комнат ----------
    private enum Feature {MONSTER, CHEST, FORK, SECRET, EMPTY}

    // ---------- Мутабельное состояние симуляции ----------
    private static final class Sim {
        final List<LogEntry> log;
        final Random rnd = new Random();
        Instant clock;

        int stamina;
        int room;
        boolean tacticOk;
        java.math.BigDecimal rewardCoins = java.math.BigDecimal.ZERO;
        final List<String> discovered;
        final List<Integer> killed;
        final List<EquipmentDef> lootOut;

        Outcome outcome = Outcome.RESTING;

        Sim(List<LogEntry> log, List<String> discovered, List<Integer> killed,
            List<EquipmentDef> lootOut, int stamina, int room, Instant clock) {
            this.log = log;
            this.discovered = discovered;
            this.killed = killed;
            this.lootOut = lootOut;
            this.stamina = stamina;
            this.room = room;
            this.clock = clock;
        }

        void advance() {
            clock = clock.plus(10 + rnd.nextInt(16), ChronoUnit.MINUTES);
        }

        void log(String icon, String text) {
            log.add(new LogEntry(clock.toString(), icon, text));
        }

        boolean roll(int chancePercent) {
            return rnd.nextInt(100) < chancePercent;
        }
    }

    /**
     * Симуляция похода. Для нового похода resume = false (вход в Комнату 1),
     * для продолжения после отдыха resume = true (герой уже в текущей комнате).
     * Возвращает исход; мутирует session (лог, комната, статус) и character (выносливость, статус).
     */
    public Outcome simulate(DungeonSession session,
                            DungeonCharacter character,
                            RunContext ctx,
                            List<EquipmentDef> lootOut,
                            boolean resume) {
        DungeonCatalog.DungeonDef dungeon = ctx.dungeon();

        List<LogEntry> log = resume ? parseLog(session) : new ArrayList<>();
        List<String> discovered = parseList(session.getDiscoveredJson());
        List<Integer> killed = parseKilled(session.getKilledJson());

        Instant clock = resume ? resumeClock(log) : Instant.now();
        Sim s = new Sim(log, discovered, killed, lootOut,
                character.getStamina(), session.getCurrentRoom(), clock);
        s.tacticOk = session.isTacticOk();

        int langChance = DungeonCatalog.checkChance(ctx.skills().langLevel(), classCheckBonus(ctx.heroClass()));
        int logicChance = DungeonCatalog.checkChance(ctx.skills().logicLevel(), classCheckBonus(ctx.heroClass()));
        double baseAttack = ctx.skills().sportLevel() * ctx.gearCoef() * classAttackMod(ctx.heroClass());

        if (!resume) {
            s.log("⏳", "Герой взял задание в таверне и отправился к «" + dungeon.name() + "».");
            s.advance();
            s.stamina = Math.max(0, s.stamina - ENTER_COST);
            s.log("⚔️", "Герой добрался до данжа и осторожно перешагнул порог Комнаты 1. (−5% выносливости)");
            s.advance();
        } else {
            s.log("🌅", "Выспавшийся герой просыпается в Комнате " + s.room + " и продолжает поход.");
            s.advance();
        }

        boolean moving = true;
        while (moving) {
            if (s.room >= dungeon.rooms()) {
                moving = bossRoom(s, ctx, baseAttack);
                continue;
            }
            Feature feature = featureFor(session, dungeon, s.room);
            switch (feature) {
                case MONSTER -> moving = monsterRoom(s, dungeon, baseAttack);
                case FORK -> moving = forkRoom(s, dungeon, langChance);
                case CHEST -> moving = chestRoom(s, ctx, logicChance);
                case SECRET -> moving = secretRoom(s, dungeon, logicChance);
                case EMPTY -> { /* пустая комната — герой просто идёт дальше */ }
            }
            if (!moving) {
                break;
            }
            // Секретная дверь могла перенести героя прямо в боссовую комнату
            if (s.room >= dungeon.rooms()) {
                continue;
            }
            // Переход в следующую комнату
            if (s.stamina < ENTER_COST) {
                sleepHere(s);
                break;
            }
            s.stamina -= ENTER_COST;
            s.room++;
            s.log("🚪", "Герой входит в Комнату " + s.room + ". (−5% выносливости)");
            s.advance();
        }

        persist(session, character, s);
        return s.outcome;
    }

    // ---------- Комнаты ----------

    /** Боссованная комната. Возвращает false, если поход завершён (WON/LOST). */
    private boolean bossRoom(Sim s, RunContext ctx, double baseAttack) {
        DungeonCatalog.DungeonDef dungeon = ctx.dungeon();
        int bossRoomNo = dungeon.rooms();

        // Тактика перед боссом (только при ≥10% выносливости)
        String tacticKey = bossRoomNo + ":tactic";
        if (!s.discovered.contains(tacticKey)) {
            if (s.stamina >= 10) {
                if (s.roll(logicChanceFor(ctx))) {
                    s.discovered.add(tacticKey);
                    s.tacticOk = true;
                    s.log("🧠", "Герой изучает тактику перед Боссом и находит слабое место! Модификатор боя ×2.0.");
                } else {
                    s.log("🧠", "Разгадать тактику Босса не удалось — бой пройдёт в лоб (×1.0).");
                }
            } else {
                s.log("🧠", "Сил не хватает на изучение тактики — бой пройдёт в лоб (×1.0).");
            }
            s.advance();
        }

        // Бой с боссом
        double attack = baseAttack * (s.tacticOk ? 2.0 : 1.0);
        s.log("💀", "Босс «" + dungeon.bossName() + "» преграждает путь! Началась решающая битва.");
        s.advance();
        int spent = 0;
        while (true) {
            if (s.stamina < ATTEMPT_COST) {
                s.log("🩸", "Выносливость на нуле... " + dungeon.bossName()
                        + " одолевает героя! Раненого героя эвакуируют в город. При следующем заходе данж придётся зачищать заново.");
                s.advance();
                s.outcome = Outcome.LOST;
                return false;
            }
            s.stamina -= ATTEMPT_COST;
            spent += ATTEMPT_COST;
            double roll = attack * (0.9 + s.rnd.nextDouble() * 0.25);
            if (roll >= dungeon.bossPower()) {
                s.log("✨", "Благодаря отличной спортивной подготовке герой сокрушил " + dungeon.bossName()
                        + "! (Потрачено " + spent + "% выносливости)");
                s.advance();
                break;
            }
            s.log("⚔️", "Удар героя приходится мимо! " + dungeon.bossName()
                    + " контратакует, герой бросается в бой снова. (−5% выносливости)");
            s.advance();
        }

        // Трофеи босса
        EquipmentDef loot = ctx.lootPicker().get();
        if (loot != null) {
            s.lootOut.add(loot);
            s.log("🎁", "Из сокровищницы Босса герой забирает нераспознанную вещь. Мудрец в таверне определит её ценность.");
            s.advance();
        }
        if (s.rnd.nextDouble() < 0.5) {
            EquipmentDef bonus = ctx.lootPicker().get();
            if (bonus != null) {
                s.lootOut.add(bonus);
                s.log("🎁", "Ещё один трофей найден среди россыпей золота!");
                s.advance();
            }
        }
        s.log("🏆", "Данж «" + dungeon.name() + "» зачищен! Герой возвращается в город, сдаёт квест в Таверне и получает награду: "
                + (int) dungeon.coins() + " монет.");
        s.advance();
        s.rewardCoins = BigDecimal.valueOf(dungeon.coins());
        s.outcome = Outcome.WON;
        return false;
    }

    /** Бой с обычным монстром. Возвращает false, если поход завершён (LOST). */
    private boolean monsterRoom(Sim s, DungeonCatalog.DungeonDef dungeon, double baseAttack) {
        if (s.killed.contains(s.room)) {
            return true; // монстр уже побеждён
        }
        String monster = dungeon.monsterForRoom(s.room);
        double power = dungeon.monsterPower(s.room);
        s.log("👣", "В темноте Комнаты " + s.room + " замечены враги: " + monster + "! Начался бой.");
        s.advance();
        int spent = 0;
        while (true) {
            if (s.stamina < ATTEMPT_COST) {
                s.log("🩸", "Выносливость на нуле... " + monster
                        + " одолевает героя! Раненого героя выносят из данжа. Поход придётся начать заново.");
                s.advance();
                s.outcome = Outcome.LOST;
                return false;
            }
            s.stamina -= ATTEMPT_COST;
            spent += ATTEMPT_COST;
            double roll = baseAttack * (0.9 + s.rnd.nextDouble() * 0.25);
            if (roll >= power) {
                s.killed.add(s.room);
                s.log("✨", "Герой сокрушил " + monster + "! (Потрачено " + spent + "% выносливости)");
                s.advance();
                return true;
            }
            s.log("⚔️", monster + " отбивает атаку! Герой бросается в бой снова. (−5% выносливости)");
            s.advance();
        }
    }

    /**
     * Развилка (Иностранный язык). Провал → телепорт в Комнату 1 и обратный проход
     * по старым комнатам (-5% каждая, проверки не повторяются); повторная развилка проходится автоматически.
     */
    private boolean forkRoom(Sim s, DungeonCatalog.DungeonDef dungeon, int langChance) {
        boolean known = s.discovered.contains(s.room + ":fork") || s.discovered.contains(s.room + ":forkfail");
        if (!known) {
            s.log("🧭", "В Комнате " + s.room + " обнаружена развилка. Герой читает древние письмена (Иностранный язык)...");
            s.advance();
            if (s.roll(langChance)) {
                s.discovered.add(s.room + ":fork");
                s.log("🧭", "Письмена расшифрованы! Герой уверенно выбирает верный путь.");
                s.advance();
                return true;
            }
            s.discovered.add(s.room + ":forkfail");
            s.log("🌀", "Герой ошибся и заблудился в лабиринте! Он снова у входа в данж — у Комнаты 1.");
            s.advance();
            int forkRoom = s.room;
            s.room = 1;
            for (int r = 1; r <= forkRoom - 1; r++) {
                if (s.stamina < ENTER_COST) {
                    s.room = r;
                    sleepHere(s);
                    return false;
                }
                s.stamina -= ENTER_COST;
                s.log("🚶", "Герой возвращается через Комнату " + r + ". (−5% выносливости, проверки уже пройдены)");
                s.advance();
            }
            if (s.stamina < ENTER_COST) {
                s.room = forkRoom;
                sleepHere(s);
                return false;
            }
            s.stamina -= ENTER_COST;
            s.room = forkRoom;
            s.log("🚶", "Герой возвращается в Комнату " + forkRoom
                    + ". Неверный путь уже известен — проход автоматический! (−5% выносливости)");
            s.advance();
            return true;
        }
        s.log("🧭", "Знакомая развилка в Комнате " + s.room + " — герой идёт уверенно, не тратя время на проверки.");
        s.advance();
        return true;
    }

    /** Сундук с замком (Логика): успех — лут, провал — сундук остаётся закрытым. */
    private boolean chestRoom(Sim s, RunContext ctx, int logicChance) {
        if (s.discovered.contains(s.room + ":chest")) {
            return true;
        }
        s.log("🔍", "В Комнате " + s.room + " обнаружен запертый сундук. Герой пытается взломать замок (Логика)...");
        s.advance();
        if (s.roll(logicChance)) {
            s.discovered.add(s.room + ":chest");
            EquipmentDef loot = ctx.lootPicker().get();
            if (loot != null) {
                s.lootOut.add(loot);
                s.log("🎁", "Замок поддался! В сундуке найдена нераспознанная вещь — её определит мудрец в таверне.");
            } else {
                s.log("🎁", "Замок поддался! В сундуке герой находит горсть монет.");
            }
        } else {
            s.log("🔒", "Замок оказался хитрее. Герой идёт дальше, оставив сундук на потом.");
        }
        s.advance();
        return true;
    }

    /** Скрытая дверь (Логика): успех — короткий путь к Боссу, провал — обычный путь. */
    private boolean secretRoom(Sim s, DungeonCatalog.DungeonDef dungeon, int logicChance) {
        if (s.discovered.contains(s.room + ":secret")) {
            return true;
        }
        s.log("🧩", "В Комнате " + s.room + " герой замечает подозрительную стену. Задача на Логику: где скрытая дверь?");
        s.advance();
        if (s.roll(logicChance)) {
            s.discovered.add(s.room + ":secret");
            s.log("🚪", "Щёлк! Скрытая дверь открыта — найден короткий путь прямо к Боссу!");
            s.advance();
            if (s.stamina < ENTER_COST) {
                sleepHere(s);
                return false;
            }
            s.stamina -= ENTER_COST;
            s.room = dungeon.rooms();
            s.log("🌙", "Коротким путём герой попадает в Комнату " + s.room + " — логово Босса. (−5% выносливости)");
            s.advance();
            return true;
        }
        s.log("🧱", "Стена остаётся глухой. Герой идёт стандартным длинным путём.");
        s.advance();
        return true;
    }

    private void sleepHere(Sim s) {
        s.log("😴", "Герой выбился из сил и засыпает прямо в Комнате " + s.room
                + ". Утром (в 9:00) он продолжит путь с этого места.");
        s.advance();
        s.outcome = Outcome.RESTING;
    }

    // ---------- Детерминированная «карта» комнат ----------

    /** Одинаковая для всех генераций этой сессии (resume не меняет раскладку). */
    private Feature featureFor(DungeonSession session, DungeonCatalog.DungeonDef dungeon, int room) {
        if (room <= 1 || room >= dungeon.rooms()) {
            return Feature.EMPTY; // вход и боссовая комната
        }
        Random rnd = new Random(session.getId() * 31L + room);
        double f = rnd.nextDouble();
        if (f < 0.40) return Feature.MONSTER;
        if (f < 0.60) return Feature.CHEST;
        if (f < 0.75) return Feature.FORK;
        if (f < 0.85) return Feature.SECRET;
        return Feature.EMPTY;
    }

    // ---------- Утилиты ----------

    private static double classAttackMod(String heroClass) {
        return switch (heroClass == null ? "" : heroClass) {
            case "WARRIOR" -> 1.15;
            case "ARCHER" -> 1.10;
            default -> 1.0; // MAGE
        };
    }

    private static int classCheckBonus(String heroClass) {
        return "MAGE".equals(heroClass) ? 5 : 0;
    }

    private int logicChanceFor(RunContext ctx) {
        return DungeonCatalog.checkChance(ctx.skills().logicLevel(), classCheckBonus(ctx.heroClass()));
    }

    /** Часы возобновления: не раньше последнего события лога + 30 минут. */
    private static Instant resumeClock(List<LogEntry> log) {
        Instant now = Instant.now();
        if (log.isEmpty()) {
            return now;
        }
        try {
            Instant last = Instant.parse(log.get(log.size() - 1).at());
            Instant candidate = last.plus(Duration.ofMinutes(30));
            return candidate.isAfter(now) ? candidate : now;
        } catch (Exception e) {
            return now;
        }
    }

    /** День лимита: начинается в 09:00 МСК (как и лимиты экрана). */
    public static LocalDate currentLimitDay() {
        ZoneId zone = ZoneId.of("Europe/Moscow");
        ZonedDateTime msk = Instant.now().atZone(zone);
        ZonedDateTime dayStart = msk.toLocalDate().atTime(9, 0).atZone(zone);
        return msk.isBefore(dayStart) ? msk.toLocalDate().minusDays(1) : msk.toLocalDate();
    }

    private void persist(DungeonSession session, DungeonCharacter character, Sim s) {
        session.setCurrentRoom(s.room);
        session.setTacticOk(s.tacticOk);
        if (s.outcome == Outcome.WON) {
            session.setRewardCoins(s.rewardCoins);
        }
        session.setDiscoveredJson(toJson(s.discovered));
        session.setKilledJson(toJsonInts(s.killed));
        session.setLogJson(toJsonLog(s.log));
        character.setStamina(s.stamina);

        switch (s.outcome) {
            case WON -> {
                session.setStatus("WON");
                session.setFinishedAt(Instant.now());
                character.setStatus("FREE");
            }
            case LOST -> {
                session.setStatus("LOST");
                session.setFinishedAt(Instant.now());
                character.setStatus("FREE");
                character.setStamina(0);
            }
            case RESTING -> {
                session.setStatus("RESTING");
                session.setResumeDay(currentLimitDay().plusDays(1));
                character.setStatus("RESTING");
            }
        }
    }

    // ---------- JSON ----------

    private static final com.fasterxml.jackson.databind.ObjectMapper MAPPER =
            new com.fasterxml.jackson.databind.ObjectMapper();

    static List<LogEntry> parseLog(DungeonSession session) {
        try {
            return MAPPER.readValue(session.getLogJson(),
                    MAPPER.getTypeFactory().constructCollectionType(List.class, LogEntry.class));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    static List<String> parseList(String json) {
        try {
            return MAPPER.readValue(json, MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    static List<Integer> parseKilled(String json) {
        try {
            return MAPPER.readValue(json, MAPPER.getTypeFactory().constructCollectionType(List.class, Integer.class));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private static String toJson(List<String> list) {
        try {
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    private static String toJsonInts(List<Integer> list) {
        try {
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    private static String toJsonLog(List<LogEntry> log) {
        try {
            return MAPPER.writeValueAsString(log);
        } catch (Exception e) {
            return "[]";
        }
    }
}
