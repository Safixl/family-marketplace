package com.familymarket.achievement;

import com.familymarket.user.User;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Стартовый комплект достижений навыка «Чтение».
 *
 * 4 многоуровневых общих шкалы (по 11 ступеней), 12 жанровых шкал (по 11 рангов),
 * серийные книжные квесты и особые одиночные испытания.
 */
public final class AchievementDefaults {

    /** Ранги жанровых достижений (уровень 1..11). */
    private static final String[] RANKS = {
            "Ученик", "Новичок", "Подмастерье", "Специалист", "Искатель", "Эксперт",
            "Мастер", "Гроссмейстер", "Магистр", "Легенда", "Божество жанра"};

    /** Шкала количества книг жанровых достижений. */
    private static final int[] BOOK_COUNTS = {1, 3, 5, 8, 12, 16, 20, 25, 30, 35, 40};

    /** Опыт за ступени многоуровневых достижений (I→XI). */
    public static final int[] LEVEL_XP = {10, 25, 50, 85, 130, 190, 270, 370, 500, 660, 860};

    /** Опыт за одиночные достижения (квесты, вызовы, сеты). */
    public static final int SINGLE_XP = 130;

    private AchievementDefaults() {
    }

    public static List<Achievement> reading(User parent) {
        List<Achievement> out = new ArrayList<>();

        // ---------- Общие многоуровневые (11 ступеней) ----------

        addLevels(out, parent, "Марафонец страниц",
                "Всего прочитано страниц. Шкала прокачки физической выносливости чтеца.",
                "👟", "READING_PAGES", "READING_PAGES",
                new int[]{100, 500, 1500, 3000, 5000, 10000, 20000, 35000, 50000, 65000, 80000},
                new String[]{"Спринтер-новичок", "Бегун по строчкам", "Торпедо", "Покоритель глав",
                        "Выносливый чтец", "Марафонец", "Железный читатель", "Ультрамарафонец",
                        "Пресмыкающийся по буквам", "Книжный титан", "Бесконечный двигатель"},
                "страниц");

        addLevels(out, parent, "Книжный червь",
                "Всего прочитано книг. Шкала накопления мудрости и личного авторитета.",
                "🐛", "READING_BOOKS", "READING_BOOKS",
                new int[]{1, 5, 15, 30, 50, 80, 120, 160, 200, 250, 300},
                new String[]{"Слушатель историй", "Книжный новобранец", "Искатель смыслов", "Книголюб-исследователь",
                        "Хранитель страниц", "Мастер сюжетов", "Книжный гроссмейстер", "Проводник по мирам",
                        "Магистр слова", "Мудрец книжных глубин", "Повелитель библиотек"},
                "книг");

        addLevels(out, parent, "Литературный турист",
                "Количество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.",
                "🎒", "READING_GENRES", "READING_GENRES",
                new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12},
                new String[]{"Первый шаг за порог", "Местный турист", "Любопытный путник", "Смелый первопроходец",
                        "Следопыт", "Картограф вселенных", "Искатель приключений", "Межпространственный гид",
                        "Покоритель горизонтов", "Кругосветный путешественник", "Космополит всея литературы"},
                "жанров");

        addLevels(out, parent, "Покоритель циклов",
                "Прочитано книжных серий. Шкала верности большим историям и долгим приключениям.",
                "⛓️", "READING_SERIES", "READING_SERIES",
                new int[]{1, 2, 4, 6, 8, 10, 12, 15, 18, 22, 25},
                new String[]{"Свидетель дилогии", "Собиратель трилогий", "Ценитель продолжений", "Охотник за томами",
                        "Хранитель франшиз", "Коллекционер саг", "Знаток сиквелов", "Мастер многотомников",
                        "Архивариус историй", "Покоритель эпиков", "Властелин Книжных Вселенных"},
                "серий");

        // ---------- Жанровые многоуровневые (12 жанров × 11 рангов) ----------

        addGenre(out, parent, "READING_GENRE_FANTASY", "🔮", "Мастер заклинаний", "Фэнтези",
                "от Ученика чародея до Верховного Мага");
        addGenre(out, parent, "READING_GENRE_SCIFI", "🚀", "Капитан звездолета", "Научная фантастика / Sci-Fi",
                "от Кадета академии до Адмирала Галактики");
        addGenre(out, parent, "READING_GENRE_DETECTIVE", "🔍", "Детектив с лупой", "Детективы",
                "от Помощника шерифа до Шерлока Холмса");
        addGenre(out, parent, "READING_GENRE_ADVENTURE", "🗺️", "Хранитель тайн", "Приключения",
                "от Юнги до Легендарного первооткрывателя");
        addGenre(out, parent, "READING_GENRE_CONTEMPORARY", "🏫", "Проводник в реальность", "Современная проза",
                "от Наблюдателя до Знатока человеческих душ");
        addGenre(out, parent, "READING_GENRE_HISTORY", "🛡️", "Исследователь прошлого", "Исторические романы",
                "от Очевидца до Хранителя Времени");
        addGenre(out, parent, "READING_GENRE_HORROR", "👻", "Шепот в темноте", "Ужасы и мистика",
                "от Боязливого полуночника до Повелителя кошмаров");
        addGenre(out, parent, "READING_GENRE_SCIENCE", "🧠", "Ученый совет", "Научпоп и энциклопедии",
                "от Любознайки до Академика наук");
        addGenre(out, parent, "READING_GENRE_FAIRYTALE", "🦉", "Мудрая сова", "Сказки, мифы, легенды",
                "от Слушателя няни до Хранителя древних преданий");
        addGenre(out, parent, "READING_GENRE_POETRY", "📜", "Ловец рифм", "Поэзия",
                "от Чтеца стишков до Бессмертного поэта");
        addGenre(out, parent, "READING_GENRE_COMICS", "🎨", "Живые картинки", "Комиксы и манга",
                "от Листателя страниц до Архивариуса визуального искусства");
        addGenre(out, parent, "READING_GENRE_HUMOR", "🤡", "Смех сквозь строки", "Юмор",
                "от Улыбающегося читателя до Короля комедии");

        // ---------- Большие книжные квесты (серии, чек-листы) ----------

        single(out, parent, "⚡", "Мальчик, который выжил",
                "Прочесть серию о Гарри Поттере:\n«Гарри Поттер и философский камень»\n«Гарри Поттер и Тайная комната»\n"
                        + "«Гарри Поттер и узник Азкабана»\n«Гарри Поттер и Кубок огня»\n«Гарри Поттер и Орден Феникса»\n"
                        + "«Гарри Поттер и Принц-полукровка»\n«Гарри Поттер и Дары Смерти»\n«Гарри Поттер и Проклятое дитя»",
                "READING_QUEST_HP");
        single(out, parent, "💍", "Хранитель Кольца",
                "Прочесть «Властелин колец»:\n«Братство Кольца»\n«Две крепости»\n«Возвращение короля»",
                "READING_QUEST_LOTR");
        single(out, parent, "🦁", "Через шкаф в Нарнию",
                "Прочесть «Хроники Нарнии»:\n«Племянник чародея»\n«Лев, Колдунья и Платяной шкаф»\n«Конь и его мальчик»\n"
                        + "«Принц Каспиан»\n«Покоритель зари»\n«Серебряное кресло»\n«Последняя битва»",
                "READING_QUEST_NARNIA");
        single(out, parent, "💚", "Житель Изумрудного города",
                "Прочесть цикл А. Волкова:\n«Волшебник Изумрудного города»\n«Урфин Джюс и его деревянные солдаты»\n"
                        + "«Семь подземных королей»\n«Огненный бог Марранов»\n«Желтый туман»\n«Тайна заброшенного замка»",
                "READING_QUEST_EMERALD");
        single(out, parent, "🔱", "Перси Джексон и олимпийцы",
                "Прочесть серию Р. Риордана:\n«Похититель молний»\n«Море чудовищ»\n«Проклятие титана»\n"
                        + "«Лабиринт смерти»\n«Последнее пророчество»",
                "READING_QUEST_PERCY");

        // ---------- Особые одиночные испытания ----------

        singleWithTarget(out, parent, "🌟", "Абсолютный Всевед",
                "Прочитать хотя бы по одной книге из всех 12 жанров: Фэнтези, Научная фантастика, Детектив, "
                        + "Приключения, Современная проза, Исторические романы, Ужасы, Научпоп, Сказки, Поэзия, "
                        + "Комиксы, Юмор.",
                "READING_OMNIVORE", "READING_GENRES", 12);
        singleWithTarget(out, parent, "🐋", "Книжный Кит",
                "Прочитать одну тяжёлую книгу объёмом более 600 страниц.",
                "READING_WHALE", "READING_HEAVY_BOOKS", 1);
        singleWithTarget(out, parent, "🔥", "Неудержимый",
                "Читать каждый день без пропусков в течение 30 дней.",
                "READING_STREAK", "READING_STREAK", 30);
        single(out, parent, "⚡", "Быстрее ветра",
                "Прочитать полноценную книгу (от 200 страниц) быстрее, чем за 3 дня.",
                "READING_FAST");
        single(out, parent, "🗣️", "Литературный критик",
                "Рассказать родителям содержательные отзывы на 10 разных книг.",
                "READING_CRITIC");
        single(out, parent, "🧭", "Книжный первооткрыватель",
                "Прочитать книгу совершенно нового автора, о котором раньше никогда не слышал.",
                "READING_PIONEER");
        single(out, parent, "🔄", "Второе дыхание",
                "Перечитать свою самую любимую книгу от начала до конца ещё раз.",
                "READING_REREAD");
        single(out, parent, "🎬", "Судья экранизаций",
                "Прочитать книгу, посмотреть по ней фильм/мультфильм и честно сравнить их.",
                "READING_MOVIE");
        single(out, parent, "🔦", "Ночной дозор",
                "Тайком или с разрешения прочитать целую главу под одеялом с фонариком.",
                "READING_NIGHT");
        single(out, parent, "🎒", "Чтение без границ",
                "Прочитать книгу полностью вне дома (в парке, в путешествии, в поезде).",
                "READING_OUTSIDE");
        single(out, parent, "📚", "Книжный стилист",
                "Навести идеальный порядок на своей книжной полке и расставить книги по цветам, авторам или размеру.",
                "READING_SHELF");

        return out;
    }

    /** Стартовый комплект достижений навыка «Математика». */
    public static List<Achievement> math(User parent) {
        List<Achievement> out = new ArrayList<>();

        // ---------- Общие многоуровневые (11 ступеней) ----------

        addLevelsMath(out, parent, "Вычислительная машина",
                "Всего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.",
                "🔢", "MATH_TASKS", "MATH_EXAMPLES",
                new int[]{100, 500, 1500, 3000, 5000, 10000, 20000, 35000, 50000, 65000, 80000},
                new String[]{"Цифровой первоклашка", "Калькулятор на батарейках", "Счетные счеты", "Властелин плюсов и минусов",
                        "Умножающий разум", "Процессор Core i3", "Мастер алгоритмов", "Цифровой гроссмейстер",
                        "Квантовый компьютер", "Укротитель бесконечности", "Абсолютный Вычислитель"},
                "примеров");

        addLevelsMath(out, parent, "Главный архитектор",
                "Решено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.",
                "🧩", "NONE", "MATH_WORD",
                new int[]{5, 15, 40, 80, 150, 250, 400, 600, 850, 1100, 1400},
                new String[]{"Искатель условий", "Распутыватель клубков", "Логический детектив", "Инженер смыслов",
                        "Мастер чертежей", "Взломщик теорем", "Конструктор решений", "Проектировщик матриц",
                        "Профессор логики", "Архитектор гипотез", "Повелитель Математических Миров"},
                "задач");

        addLevelsMath(out, parent, "Испытатель тестов",
                "Успешно сданные тесты, контрольные и карточки на «4» и «5».",
                "📝", "MATH_CARDS", "MATH_TESTS",
                new int[]{5, 15, 30, 50, 80, 120, 170, 230, 300, 380, 450},
                new String[]{"Тестовый дебютант", "Уверенный отличник", "Охотник за пятерками", "Критик ошибок",
                        "Гроза контрольных", "Тестовый эксперт", "Несокрушимый разум", "Магистр экзаменов",
                        "Железный отличник", "Провидец ответов", "Абсолютный Цензор"},
                "работ");

        // ---------- Категории заданий (10 × 11 званий) ----------

        addMathCategory(out, parent, "MATH_CAT_EQUATIONS", "⚖️", "Укротитель Иксов",
                "Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.");
        addMathCategory(out, parent, "MATH_CAT_ARITHMETIC", "⚡", "Арифметика в уме",
                "Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.");
        addMathCategory(out, parent, "MATH_CAT_MULTDIV", "✖️", "Король Пропорций",
                "Умножение и деление: в столбик, многозначные числа, сокращение дробей.");
        addMathCategory(out, parent, "MATH_CAT_POWER", "🔝", "Сила в Кубе",
                "Возведение в квадрат и степень: прокачка работы со степенями чисел.");
        addMathCategory(out, parent, "MATH_CAT_ROOT", "🌱", "Извлекатель Корней",
                "Квадратные корни: магия высвобождения чисел из-под знака корня.");
        addMathCategory(out, parent, "MATH_CAT_FRACTIONS", "🍕", "Повелитель Долей",
                "Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).");
        addMathCategory(out, parent, "MATH_CAT_GEOMETRY", "📐", "Геометрический Гений",
                "Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).");
        addMathCategory(out, parent, "MATH_CAT_CARD_EASY", "🃏", "Легкая прогулка",
                "Карточки с заданиями: лёгкий уровень.");
        addMathCategory(out, parent, "MATH_CAT_CARD_MEDIUM", "⚔️", "Крепкий орешек",
                "Карточки с заданиями: средний уровень.");
        addMathCategory(out, parent, "MATH_CAT_CARD_HARD", "🔥", "Зона хардкора",
                "Карточки с заданиями: сложный уровень.");

        // ---------- Большие математические квесты ----------

        singleMath(out, parent, "🛡️", "Главный босс школы",
                "Покоритель ВПР — сдать Всероссийские проверочные работы по математике на максимальный балл:\n"
                        + "ВПР за 4 класс (базовая арифметика и логика)\nВПР за 5 класс (дроби и основы геометрии)\n"
                        + "ВПР за 6 класс (отрицательные числа, пропорции)\nВПР за 7 класс (начало алгебры и геометрии)\n"
                        + "ВПР за 8 класс (функции, системы, теоремы)",
                "MATH_QUEST_VPR");
        singleMath(out, parent, "🎪", "Олимпийский резерв",
                "Успешно поучаствовать в школьных или онлайн-олимпиадах:\n"
                        + "Школьный этап Всероссийской олимпиады\nОлимпиада «Кенгуру» (или аналогичная)\n"
                        + "Набрать более 80% правильных ответов в любом олимпиадном туре",
                "MATH_QUEST_OLYMP");
        singleMath(out, parent, "⭐", "Звездная Карта",
                "Карточки особого уровня — решить 5 уникальных нестандартных задач повышенной сложности:\n"
                        + "Особая карточка №1\nОсобая карточка №2\nОсобая карточка №3\nОсобая карточка №4\nОсобая карточка №5",
                "MATH_QUEST_STAR");

        // ---------- Особые одиночные испытания ----------

        singleMath(out, parent, "🔮", "Математический универсал",
                "Правильно решить за один день хотя бы по одному заданию из 6 разных тем (уравнение, текстовая задача, "
                        + "пример на скорость, дробь, геометрия, степень).",
                "MATH_UNIVERSAL");
        singleMath(out, parent, "🦖", "Убийца гигантов",
                "Безошибочно решить пример, в котором больше 10 действий (со скобками, умножением и делением).",
                "MATH_GIANT");
        singleMath(out, parent, "⏱️", "Быстрее калькулятора",
                "Решить 20 простых примеров на умножение/деление в уме меньше чем за 1 минуту.",
                "MATH_FAST");
        singleMath(out, parent, "👨‍🏫", "Юный профессор",
                "Объяснить родителю или другу, как решается сложное уравнение или задача, так, чтобы они всё поняли.",
                "MATH_PROF");
        singleMathWithTarget(out, parent, "🔥", "Вычислительный стрик",
                "Заниматься математикой и решать не менее 15 примеров каждый день в течение 21 дня без перерывов.",
                "MATH_STREAK", "MATH_STREAK", 21);
        singleMath(out, parent, "🔎", "Детектив ошибок",
                "Найти ошибку в чужом решении (или специально допущенную родителем ошибку в примере) и исправить её.",
                "MATH_ERR_DETECT");
        singleMath(out, parent, "📓", "Идеальный черновик",
                "Исписать целую тетрадь в клетку аккуратными вычислениями без единой вырванной страницы.",
                "MATH_NOTEBOOK");
        singleMath(out, parent, "📐", "Циркуль-мастер",
                "Построить идеальный геометрический чертёж с помощью линейки и циркуля без помарок с первой попытки.",
                "MATH_COMPASS");

        // ---------- Ежедневные карточки (динамический генератор) ----------

        addLevelsMath(out, parent, "Карточный стратег",
                "Успешно решённые ежедневные карточки «Математика» (80%+ верных ответов).",
                "🃏", "MATH_CARD_SUCCESS", "MATH_CARD_DAY",
                new int[]{3, 10, 25, 50, 80, 120, 170, 230, 300, 380, 450},
                new String[]{"Первая пара", "Любитель карточек", "Десятка за картами", "Пятидесятый рубеж",
                        "Карточный ветеран", "Штурман колоды", "Сто семьдесят", "Мастер колоды",
                        "Триста карт", "Гроссмейстер карт", "Повелитель Карточной Колоды"},
                "карточек");

        addLevelsMath(out, parent, "Карточный марафонец",
                "Дней подряд с завершённой карточкой по математике (не пропускать ни дня).",
                "📅", "MATH_CARD_STREAK", "MATH_CARD_STREAK",
                new int[]{3, 7, 14, 21, 30, 45, 60, 90, 120, 180, 365},
                new String[]{"Разминка", "Неделя в строю", "Двухнедельный марафон", "Три недели упорства",
                        "Месяц математики", "Полтора месяца", "Два месяца", "Квартал без остановки",
                        "Сезон математика", "Полгода точности", "Год точных наук"},
                "дней");

        singleMathWithTarget(out, parent, "🃏", "Первая победа",
                "Успешно решить первую карточку уровня «Лёгкая».",
                "MATH_CARD_LVL_EASY", "MATH_CARD_LVL_EASY", 1);
        singleMathWithTarget(out, parent, "🔥", "Хардкорщик",
                "Успешно решить карточку уровня «Хард».",
                "MATH_CARD_LVL_EXTREME", "MATH_CARD_LVL_EXTREME", 1);
        singleMathWithTarget(out, parent, "🏆", "Олимпийский запас",
                "Успешно решить олимпиадную карточку.",
                "MATH_CARD_LVL_OLYMPIAD", "MATH_CARD_LVL_OLYMPIAD", 1);

        return out;
    }

    // ---------- Сборка ----------

    private static void addLevels(List<Achievement> out, User parent, String name, String description, String icon,
                                  String targetType, String groupKey, int[] values, String[] stepNames, String unit) {
        for (int i = 0; i < values.length; i++) {
            Achievement a = new Achievement();
            a.setParent(parent);
            a.setName(name);
            a.setDescription(stepNames[i] + " — " + values[i] + " " + unit + ".\n" + description);
            a.setIcon(icon);
            a.setTargetType(targetType);
            a.setTargetValue(values[i]);
            a.setGroupKey(groupKey);
            a.setSkill("READING");
            a.setLevel(i + 1);
            a.setXpReward(LEVEL_XP[i]);
            a.setHiddenReward(false);
            a.setCreatedAt(Instant.now());
            out.add(a);
        }
    }

    /** Вариант addLevels для навыка «Математика». */
    private static void addLevelsMath(List<Achievement> out, User parent, String name, String description, String icon,
                                      String targetType, String groupKey, int[] values, String[] stepNames, String unit) {
        for (int i = 0; i < values.length; i++) {
            Achievement a = new Achievement();
            a.setParent(parent);
            a.setName(name);
            a.setDescription(stepNames[i] + " — " + values[i] + " " + unit + ".\n" + description);
            a.setIcon(icon);
            a.setTargetType(targetType);
            a.setTargetValue(values[i]);
            a.setGroupKey(groupKey);
            a.setSkill("MATH");
            a.setLevel(i + 1);
            a.setXpReward(LEVEL_XP[i]);
            a.setHiddenReward(false);
            a.setCreatedAt(Instant.now());
            out.add(a);
        }
    }

    private static void addGenre(List<Achievement> out, User parent, String groupKey, String icon, String name,
                                 String genreLabel, String pathLine) {
        for (int i = 0; i < RANKS.length; i++) {
            Achievement a = new Achievement();
            a.setParent(parent);
            a.setName(name + " · " + genreLabel);
            a.setDescription(RANKS[i] + " — " + BOOK_COUNTS[i] + " книг · " + genreLabel + ". " + pathLine + ".");
            a.setIcon(icon);
            a.setTargetType(groupKey);
            a.setTargetValue(BOOK_COUNTS[i]);
            a.setGroupKey(groupKey);
            a.setSkill("READING");
            a.setLevel(i + 1);
            a.setXpReward(LEVEL_XP[i]);
            a.setHiddenReward(false);
            a.setCreatedAt(Instant.now());
            out.add(a);
        }
    }

    /** Категория заданий математики: общая шкала 10→20 000, звания Стажер→Математический Титан. */
    private static void addMathCategory(List<Achievement> out, User parent, String groupKey, String icon,
                                        String name, String hint) {
        String[] ranks = {"Стажер", "Новичок", "Практик", "Специалист", "Аналитик", "Эксперт",
                "Мастер", "Гроссмейстер", "Магистр", "Легенда", "Математический Титан"};
        int[] counts = {10, 50, 150, 400, 1000, 2500, 5000, 8000, 12000, 16000, 20000};
        for (int i = 0; i < ranks.length; i++) {
            Achievement a = new Achievement();
            a.setParent(parent);
            a.setName(name);
            a.setDescription(ranks[i] + " — " + counts[i] + " заданий · " + name + ". " + hint);
            a.setIcon(icon);
            a.setTargetType("NONE");
            a.setTargetValue(counts[i]);
            a.setGroupKey(groupKey);
            a.setSkill("MATH");
            a.setLevel(i + 1);
            a.setXpReward(LEVEL_XP[i]);
            a.setHiddenReward(false);
            a.setCreatedAt(Instant.now());
            out.add(a);
        }
    }

    private static void single(List<Achievement> out, User parent, String icon, String name, String description,
                               String groupKey) {
        singleWithTarget(out, parent, icon, name, description, groupKey, "NONE", 0);
    }

    private static void singleMath(List<Achievement> out, User parent, String icon, String name, String description,
                                   String groupKey) {
        singleMathWithTarget(out, parent, icon, name, description, groupKey, "NONE", 0);
    }

    private static void singleMathWithTarget(List<Achievement> out, User parent, String icon, String name,
                                             String description, String groupKey, String targetType, int targetValue) {
        Achievement a = new Achievement();
        a.setParent(parent);
        a.setName(name);
        a.setDescription(description);
        a.setIcon(icon);
        a.setTargetType(targetType);
        a.setTargetValue(targetValue);
        a.setGroupKey(groupKey);
        a.setSkill("MATH");
        a.setLevel(0);
        a.setXpReward(SINGLE_XP);
        a.setHiddenReward(false);
        a.setCreatedAt(Instant.now());
        out.add(a);
    }

    /** Стартовый комплект достижений навыка «Порядок в комнате». */
    public static List<Achievement> house(User parent) {
        List<Achievement> out = new ArrayList<>();

        addLevelsHouse(out, parent, "Магистр Чистоты",
                "Накопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.",
                "🧹", "HOUSE_ROOM_POINTS", "HOUSE_CLEAN_POINTS",
                new int[]{50, 250, 600, 1200, 2000, 3000, 4200, 5500, 7000, 8500, 10000},
                new String[]{"Гость в собственном доме", "Борьба с пылью", "Видимый пол", "Аккуратный жилец",
                        "Хранитель уюта", "Эксперт клининга", "Гроза беспорядка", "Эстетичный хозяин",
                        "Остров безупречности", "Перфекционист", "Абсолютный Повелитель Чистоты"},
                "баллов");

        addLevelsHouse(out, parent, "Незаменимый помощник",
                "Всего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.",
                "🤝", "HOUSE_HELP_POINTS", "HOUSE_HELP_POINTS",
                new int[]{50, 200, 500, 1000, 1800, 2800, 4000, 5300, 6700, 8200, 10000},
                new String[]{"Разовая услуга", "Полезный союзник", "Семейная опора", "Мастер на все руки",
                        "Менеджер комфорта", "Хранитель домашнего очага", "Управляющий бытом", "Правая рука семьи",
                        "Шеф-помощник", "Легенда кооперации", "Генеральный директор Уюта"},
                "баллов");

        addHouseCategory(out, parent, "HOUSE_CAT_DISHES", "🍽️", "Шеф-мойщик",
                "Мытьё посуды или загрузка/разгрузка посудомойки.");
        addHouseCategory(out, parent, "HOUSE_CAT_MOP", "🌊", "Повелитель швабры",
                "Мытьё полов или качественная сухая уборка пылесосом во всей квартире.");
        addHouseCategory(out, parent, "HOUSE_CAT_LAUNDRY", "🧺", "Стильный эксперт",
                "Загрузка стиральной машины, развешивание белья или глажка одежды.");
        addHouseCategory(out, parent, "HOUSE_CAT_SHOPPING", "🛒", "Добытчик ресурсов",
                "Поход в магазин за продуктами по списку.");
        addHouseCategory(out, parent, "HOUSE_CAT_TRASH", "🗑️", "Эко-патруль",
                "Вынос мусора (включая сортировку, если она есть).");
        addHouseCategory(out, parent, "HOUSE_CAT_COOKING", "🍳", "Су-шеф",
                "Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).");
        addHouseCategory(out, parent, "HOUSE_CAT_REPAIR", "🛠️", "Домашний инженер",
                "Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.");
        addHouseCategory(out, parent, "HOUSE_CAT_PLANTS", "🌱", "Ботаник-хранитель",
                "Полив всех комнатных растений или уход за домашним питомцем.");

        singleHouse(out, parent, "🎮", "Ультимативный Геймер",
                "Купить комбо для отдыха:\nТелевизор 📺\nИгровая приставка 🎮\nКресло-мешок или пуфик 🛋️",
                "HOUSE_SET_GAMER");
        singleHouse(out, parent, "🧠", "Кибер-оазис",
                "Собрать идеальное рабочее место:\nКомпьютер или ноутбук 💻\nУмный свет для стола 💡\nУдобное кресло 💺",
                "HOUSE_SET_CYBER");
        singleHouse(out, parent, "🔐", "Моя крепость",
                "Максимальный уровень личных границ:\nСобственный замок на дверь комнаты 🔑\n"
                        + "Личный сейф или закрывающийся ящик 🔓",
                "HOUSE_SET_FORTRESS");
        singleHouse(out, parent, "🎵", "Умный дом",
                "Технологический апгрейд комнаты:\nУмная колонка 🔊\nУмные розетки или RGB-лента, "
                        + "управляемая голосом 📱",
                "HOUSE_SET_SMARTHOME");

        singleHouseWithTarget(out, parent, "👑", "Идеальный месяц",
                "Поддерживать порядок в своей комнате на оценку «+2» 30 дней подряд без единого срыва в «0» или «−1».",
                "HOUSE_PERFECT_MONTH", "HOUSE_CLEAN_STREAK", 30);
        singleHouse(out, parent, "🚀", "Максимальный оборот",
                "Заработать за один день полные +8 баллов: +2 за идеальную комнату и +6 за шесть разных видов помощи.",
                "HOUSE_MAX_DAY");
        singleHouse(out, parent, "🎒", "Мини-минимализм",
                "Провести глобальное расхламление: выбросить или отдать 30 ненужных вещей из своей комнаты.",
                "HOUSE_MINIMALISM");
        singleHouse(out, parent, "🔧", "Сам себе дизайнер",
                "Полностью переставить мебель в комнате или переоформить рабочий стол для максимального удобства.",
                "HOUSE_DESIGNER");
        singleHouse(out, parent, "📦", "Сезонная эвакуация",
                "Самостоятельно разобрать гардероб, убрать сезонные вещи на хранение и аккуратно сложить текущую одежду.",
                "HOUSE_SEASONAL");
        singleHouse(out, parent, "🧼", "Генеральный разгром",
                "Провести «глубокую» уборку: помыть окна в комнате, протереть пыль на шкафах и постирать шторы.",
                "HOUSE_DEEP_CLEAN");

        return out;
    }

    /** Вариант addLevels для навыка «Порядок в комнате». */
    private static void addLevelsHouse(List<Achievement> out, User parent, String name, String description, String icon,
                                      String targetType, String groupKey, int[] values, String[] stepNames, String unit) {
        for (int i = 0; i < values.length; i++) {
            Achievement a = new Achievement();
            a.setParent(parent);
            a.setName(name);
            a.setDescription(stepNames[i] + " — " + values[i] + " " + unit + ".\n" + description);
            a.setIcon(icon);
            a.setTargetType(targetType);
            a.setTargetValue(values[i]);
            a.setGroupKey(groupKey);
            a.setSkill("HOUSE");
            a.setLevel(i + 1);
            a.setXpReward(LEVEL_XP[i]);
            a.setHiddenReward(false);
            a.setCreatedAt(Instant.now());
            out.add(a);
        }
    }

    /** Категория помощи по дому: шкала 5→1700 действий, звания Стажер→Генеральный директор Уюта. */
    private static void addHouseCategory(List<Achievement> out, User parent, String groupKey, String icon,
                                         String name, String hint) {
        String[] ranks = {"Стажер", "Новичок", "Практик", "Мастер", "Шеф", "Эксперт",
                "Гроссмейстер", "Магистр", "Легенда быта", "Хранитель очага", "Генеральный директор Уюта"};
        int[] counts = {5, 20, 60, 120, 250, 400, 600, 850, 1100, 1400, 1700};
        for (int i = 0; i < ranks.length; i++) {
            Achievement a = new Achievement();
            a.setParent(parent);
            a.setName(name);
            a.setDescription(ranks[i] + " — " + counts[i] + " действий · " + name + ". " + hint);
            a.setIcon(icon);
            a.setTargetType("NONE");
            a.setTargetValue(counts[i]);
            a.setGroupKey(groupKey);
            a.setSkill("HOUSE");
            a.setLevel(i + 1);
            a.setXpReward(LEVEL_XP[i]);
            a.setHiddenReward(false);
            a.setCreatedAt(Instant.now());
            out.add(a);
        }
    }

    private static void singleHouse(List<Achievement> out, User parent, String icon, String name, String description,
                                    String groupKey) {
        singleHouseWithTarget(out, parent, icon, name, description, groupKey, "NONE", 0);
    }

    private static void singleHouseWithTarget(List<Achievement> out, User parent, String icon, String name,
                                              String description, String groupKey, String targetType, int targetValue) {
        Achievement a = new Achievement();
        a.setParent(parent);
        a.setName(name);
        a.setDescription(description);
        a.setIcon(icon);
        a.setTargetType(targetType);
        a.setTargetValue(targetValue);
        a.setGroupKey(groupKey);
        a.setSkill("HOUSE");
        a.setLevel(0);
        a.setXpReward(SINGLE_XP);
        a.setHiddenReward(false);
        a.setCreatedAt(Instant.now());
        out.add(a);
    }

    private static void singleWithTarget(List<Achievement> out, User parent, String icon, String name,
                                         String description, String groupKey, String targetType, int targetValue) {
        Achievement a = new Achievement();
        a.setParent(parent);
        a.setName(name);
        a.setDescription(description);
        a.setIcon(icon);
        a.setTargetType(targetType);
        a.setTargetValue(targetValue);
        a.setGroupKey(groupKey);
        a.setSkill("READING");
        a.setLevel(0);
        a.setXpReward(SINGLE_XP);
        a.setHiddenReward(false);
        a.setCreatedAt(Instant.now());
        out.add(a);
    }
}