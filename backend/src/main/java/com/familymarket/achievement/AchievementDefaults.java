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
            a.setHiddenReward(false);
            a.setCreatedAt(Instant.now());
            out.add(a);
        }
    }

    private static void single(List<Achievement> out, User parent, String icon, String name, String description,
                               String groupKey) {
        singleWithTarget(out, parent, icon, name, description, groupKey, "NONE", 0);
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
        a.setHiddenReward(false);
        a.setCreatedAt(Instant.now());
        out.add(a);
    }
}