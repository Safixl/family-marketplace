package com.familymarket.dungeon;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

/**
 * Статический каталог подземелий, монстров и боссов.
 * Данжи идут по нарастающей сложности: монстры обыкновенные / особые / элитные + босс.
 */
public final class DungeonCatalog {

    private DungeonCatalog() {
    }

    public record DungeonDef(
            String code,
            String name,
            String emoji,
            String description,
            int rooms,
            double difficulty,      // базовая сила обыкновенного монстра
            String bossName,
            double bossPower,
            double coins,           // награда в магазине за зачистку
            int tier,               // 1..4 — влияет на качество выпадающей экипировки
            List<String> commonMonsters,
            List<String> specialMonsters,
            List<String> eliteMonsters) {

        public String monsterForRoom(int room) {
            int half = rooms / 2;
            List<String> pool;
            if (room >= rooms - 1) {
                pool = eliteMonsters;
            } else if (room > half) {
                pool = specialMonsters;
            } else {
                pool = commonMonsters;
            }
            return pool.get((room - 1) % pool.size());
        }

        public double monsterPower(int room) {
            if (room >= rooms - 1) {
                return difficulty * 1.5;
            }
            if (room > rooms / 2) {
                return difficulty * 1.25;
            }
            return difficulty;
        }
    }

    private static final Map<String, DungeonDef> DUNGEONS = Map.of(
            "SKELETON", new DungeonDef(
                    "SKELETON", "Подземелье Скелетов", "💀",
                    "Холодные коридоры под старым кладбищем. Идеальное место для первого похода.",
                    5, 0.5, "Король Скелетов", 1.2, 100, 1,
                    List.of("Скелет-стражник", "Костяной пёс"),
                    List.of("Скелет-лучник", "Гнилой зомби"),
                    List.of("Рыцарь Смерти", "Костяной голем")),
            "GOBLIN", new DungeonDef(
                    "GOBLIN", "Пещера Гоблинов", "👺",
                    "Шумные туннели, полные зелёных разбойников и награбленного добра.",
                    6, 1.0, "Вождь Гоблинов", 2.0, 160, 2,
                    List.of("Гоблин-вораишка", "Гоблин-копейщик"),
                    List.of("Гоблин-шаман", "Пещерный тролль"),
                    List.of("Гоблин-капитан", "Каменный тролль")),
            "SPIDER", new DungeonDef(
                    "SPIDER", "Логово Пауков", "🕷️",
                    "Липкая паутина тянется от стены к стене. Здесь легко заблудиться.",
                    7, 1.6, "Матриарх Пауков", 3.0, 240, 3,
                    List.of("Пещерный паук", "Ядовитая вдова"),
                    List.of("Паук-ткач", "Гигантская сколопендра"),
                    List.of("Теневой люрик", "Королевский паук")),
            "DRAGON", new DungeonDef(
                    "DRAGON", "Логово Дракона", "🐉",
                    "Древнее подземелье под горой. Только настоящим героям под силу его зачистить.",
                    8, 2.2, "Древний Дракон", 4.5, 400, 4,
                    List.of("Ящер-солдат", "Дракончик"),
                    List.of("Огненный дрейк", "Каменная гарпия"),
                    List.of("Дракон-ветеран", "Хранитель клада")));

    public static final List<DungeonDef> ALL =
            List.of(DUNGEONS.get("SKELETON"), DUNGEONS.get("GOBLIN"), DUNGEONS.get("SPIDER"), DUNGEONS.get("DRAGON"));

    public static Optional<DungeonDef> byCode(String code) {
        return Optional.ofNullable(DUNGEONS.get(code));
    }

    // ---------- Ранги и уровни навыков (зеркало frontend/src/lib/rpg.ts) ----------

    /** Минимальный уровень навыка для каждого ранга (индекс 0 = Дерево). */
    private static final int[] RANK_MIN_LEVEL = {1, 6, 12, 18, 24, 30, 36, 42, 48, 52, 60};
    private static final String[] RANK_NAMES = {
            "Дерево", "Железо", "Бронза", "Серебро", "Золото",
            "Платина", "Изумруд", "Алмаз", "Мастер", "Гранд-мастер", "Чемпион"};

    /** Индекс ранга (0 = Дерево) по уровню навыка 1..60. */
    public static int rankIndexForLevel(int level) {
        int idx = 0;
        for (int i = 0; i < RANK_MIN_LEVEL.length; i++) {
            if (level >= RANK_MIN_LEVEL[i]) {
                idx = i;
            }
        }
        return idx;
    }

    public static String rankName(int idx) {
        return RANK_NAMES[Math.max(0, Math.min(RANK_NAMES.length - 1, idx))];
    }

    /** Опыт, нужный для перехода с уровня skill level на следующий (кривая 500/1000/1500/2500). */
    private static int skillXpForLevel(int level) {
        if (level <= 10) return 500;
        if (level <= 30) return 1000;
        if (level <= 50) return 1500;
        return 2500;
    }

    /**
     * Уровень навыка (1..60) из прогресса 0..100.
     * Прогресс навыка = xp / 800; 80 000 XP = 60-й уровень.
     */
    public static int skillLevelFromProgress(int progress) {
        long xp = Math.max(0, progress) * 800L;
        int level = 1;
        long remaining = xp;
        while (level < 60 && remaining >= skillXpForLevel(level)) {
            remaining -= skillXpForLevel(level);
            level++;
        }
        return level;
    }

    /** Шанс успешной проверки навыка (0..100) по уровню навыка. */
    public static int checkChance(int skillLevel, int classBonus) {
        return Math.min(97, 40 + skillLevel + classBonus);
    }

    // ============================================================
    // ПРОГРЕССИЯ РАНГОВ ПОДЗЕМЕЛИЙ: F, D, C, B, A, S
    // ============================================================

    public static final List<String> RANKS = List.of("F", "D", "C", "B", "A", "S");

    /** Индекс ранга (F=0 … S=5); NONE = -1. */
    public static int rankIndex(String rank) {
        if (rank == null) {
            return -1;
        }
        int idx = RANKS.indexOf(rank.trim().toUpperCase());
        return idx >= 0 ? idx : -1;
    }

    /** Диапазон уровней ранга: F 1–10, D 11–20, … S 51–60. */
    public static int rankMinLevel(int idx) {
        return idx * 10 + 1;
    }

    public static int rankMaxLevel(int idx) {
        return idx * 10 + 10;
    }

    /** Сила обыкновенного монстра по уровню; босс сильнее. */
    public static double monsterPowerForLevel(int level) {
        return Math.max(0.35, level * 0.35);
    }

    public static double bossPowerForLevel(int level) {
        return Math.max(0.6, level * 0.6);
    }

    /**
     * Матрица шансов генерации квеста (Roll Rate) по рекорду игрока.
     * Ключ — max_cleared_rank, значение — веса рангов (сумма = 100).
     * Отсечение слабых данжей зашито в таблицу: пул начинается с ранга ниже рекорда.
     */
    private static final Map<String, Map<String, Integer>> ROLL_TABLE = Map.of(
            "NONE", rollRow(new String[]{"F", "100"}),
            "F", rollRow(new String[]{"D", "30", "F", "70"}),
            "D", rollRow(new String[]{"C", "40", "D", "40", "F", "20"}),
            "C", rollRow(new String[]{"B", "20", "C", "55", "D", "25"}),
            "B", rollRow(new String[]{"A", "15", "B", "60", "C", "25"}),
            "A", rollRow(new String[]{"S", "10", "A", "65", "B", "25"}),
            "S", rollRow(new String[]{"S", "70", "A", "30"}));

    private static Map<String, Integer> rollRow(String... pairs) {
        Map<String, Integer> row = new java.util.LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            row.put(pairs[i], Integer.parseInt(pairs[i + 1]));
        }
        return row;
    }

    /**
     * Случайный выбор ранга квеста по рекорду (генерация случайного числа 1..100).
     */
    public static String rollRank(String maxClearedRank, Random rnd) {
        Map<String, Integer> row = ROLL_TABLE.getOrDefault(maxClearedRank, ROLL_TABLE.get("NONE"));
        int roll = rnd.nextInt(100) + 1; // 1..100
        int acc = 0;
        for (Map.Entry<String, Integer> e : row.entrySet()) {
            acc += e.getValue();
            if (roll <= acc) {
                return e.getKey();
            }
        }
        return row.keySet().iterator().next();
    }

    /** Доступный пул рангов для интерфейса (без весов). */
    public static List<String> poolFor(String maxClearedRank) {
        return List.copyOf(ROLL_TABLE.getOrDefault(maxClearedRank, ROLL_TABLE.get("NONE")).keySet());
    }

    /** Награда за зачистку по рангу: F 100 → S 1600 монет. */
    public static double coinsForRank(int rankIdx) {
        return switch (rankIdx) {
            case 0 -> 100;
            case 1 -> 200;
            case 2 -> 350;
            case 3 -> 600;
            case 4 -> 1000;
            default -> 1600;
        };
    }

    // ---------- Темы данжей (выбираются случайно при генерации квеста) ----------

    public record Theme(String name, String emoji, String description, List<String> common, List<String> special, List<String> elite) {
    }

    private static final List<Theme> THEMES = List.of(
            new Theme("Подземелье Забытых Книг", "📖", "Пыльные залы библиотеки, где оживают потерянные сказания.",
                    List.of("Книжный голем", "Чернильный призрак"),
                    List.of("Летописец теней", "Бумажный вихрь"),
                    List.of("Хранитель томов", "Архивный дракончик")),
            new Theme("Подземелье Скелетов", "💀", "Холодные коридоры под старым кладбищем.",
                    List.of("Скелет-стражник", "Костяной пёс"),
                    List.of("Скелет-лучник", "Гнилой зомби"),
                    List.of("Рыцарь Смерти", "Костяной голем")),
            new Theme("Пещера Гоблинов", "👺", "Шумные туннели, полные зелёных разбойников.",
                    List.of("Гоблин-вораишка", "Гоблин-копейщик"),
                    List.of("Гоблин-шаман", "Пещерный тролль"),
                    List.of("Гоблин-капитан", "Каменный тролль")),
            new Theme("Логово Пауков", "🕷️", "Липкая паутина тянется от стены к стене.",
                    List.of("Пещерный паук", "Ядовитая вдова"),
                    List.of("Паук-ткач", "Гигантская сколопендра"),
                    List.of("Теневой люрик", "Королевский паук")),
            new Theme("Затопленные Катакомбы", "🌊", "Узкие проходы под водой, полные скользких теней.",
                    List.of("Болотная пиявка", "Топляк"),
                    List.of("Речной тритон", "Водяная дева"),
                    List.of("Глубинный страж", "Морской голем")),
            new Theme("Руины Гномьих Кузнецов", "⚒️", "Обвалившиеся мастерские с живыми механизмами.",
                    List.of("Зубчатый латник", "Искровой жук"),
                    List.of("Кузнечный автоматон", "Паровой голем"),
                    List.of("Мастер-механизм", "Клеймор-страж")),
            new Theme("Логово Дракона", "🐉", "Древнее подземелье под горой.",
                    List.of("Ящер-солдат", "Дракончик"),
                    List.of("Огненный дрейк", "Каменная гарпия"),
                    List.of("Дракон-ветеран", "Хранитель клада")),
            new Theme("Кристальные Чертоги", "💎", "Светящиеся залы, где кристаллы поют на разных ладах.",
                    List.of("Осколочный элементаль", "Кристальный слизень"),
                    List.of("Призма-хранитель", "Ледяная дева"),
                    List.of("Сердце Кристалла", "Гранд-элементаль")));

    private static final List<String> BOSS_NAMES = List.of(
            "Древний Дракон", "Король Скелетов", "Вождь Гоблинов", "Матриарх Пауков",
            "Титан Библиотеки", "Глубинный Левиафан", "Механо-Гроссмейстер", "Кристальный Тиран");

    /**
     * Генерация инстанса данжа выбранного ранга: случайная тема, уровень монстров
     * в диапазоне ранга, сила монстров/босса, комнаты и награда.
     */
    public static DungeonDef generateDungeon(String rank, int monsterLevel, Random rnd) {
        int idx = Math.max(0, rankIndex(rank));
        Theme theme = THEMES.get(rnd.nextInt(THEMES.size()));
        int bossLevel = rankMinLevel(idx) + (int) ((rankMaxLevel(idx) - rankMinLevel(idx) + 1) * (0.6 + rnd.nextDouble() * 0.4));
        bossLevel = Math.min(bossLevel, rankMaxLevel(idx) + 2);
        double difficulty = monsterPowerForLevel(monsterLevel);
        double bossPower = bossPowerForLevel(bossLevel);
        return new DungeonDef(
                "RANK_" + rank,
                theme.name(),
                theme.emoji(),
                theme.description() + " [Ранг " + rank + ", Уровень " + monsterLevel + "]",
                5 + idx,          // чем выше ранг, тем длиннее данж
                difficulty,
                BOSS_NAMES.get(rnd.nextInt(BOSS_NAMES.size())),
                bossPower,
                coinsForRank(idx),
                idx + 1,          // тир для качества лута
                theme.common(),
                theme.special(),
                theme.elite());
    }
}
