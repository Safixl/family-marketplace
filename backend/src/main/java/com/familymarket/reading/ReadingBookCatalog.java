package com.familymarket.reading;

import java.util.List;

/**
 * Каталог книг «из достижений»: готовые заготовки для серийных книжных квестов
 * (Гарри Поттер, Властелин колец, Хроники Нарнии, цикл Волкова, Перси Джексон).
 * Параметры заготовок используются как есть (множитель при создании = 1).
 */
public final class ReadingBookCatalog {

    public record CatalogBook(String id, String name, String author, String series, String genre, int pages, String quest) {
    }

    private static final String QUEST_HP = "READING_QUEST_HP";
    private static final String QUEST_LOTR = "READING_QUEST_LOTR";
    private static final String QUEST_NARNIA = "READING_QUEST_NARNIA";
    private static final String QUEST_EMERALD = "READING_QUEST_EMERALD";
    private static final String QUEST_PERCY = "READING_QUEST_PERCY";

    private static final List<CatalogBook> BOOKS = List.of(
            // Гарри Поттер (Фэнтези)
            book("hp-1", "Гарри Поттер и философский камень", "Дж. К. Роулинг", "Гарри Поттер", "Фэнтези", 320, QUEST_HP),
            book("hp-2", "Гарри Поттер и Тайная комната", "Дж. К. Роулинг", "Гарри Поттер", "Фэнтези", 352, QUEST_HP),
            book("hp-3", "Гарри Поттер и узник Азкабана", "Дж. К. Роулинг", "Гарри Поттер", "Фэнтези", 480, QUEST_HP),
            book("hp-4", "Гарри Поттер и Кубок огня", "Дж. К. Роулинг", "Гарри Поттер", "Фэнтези", 672, QUEST_HP),
            book("hp-5", "Гарри Поттер и Орден Феникса", "Дж. К. Роулинг", "Гарри Поттер", "Фэнтези", 800, QUEST_HP),
            book("hp-6", "Гарри Поттер и Принц-полукровка", "Дж. К. Роулинг", "Гарри Поттер", "Фэнтези", 672, QUEST_HP),
            book("hp-7", "Гарри Поттер и Дары Смерти", "Дж. К. Роулинг", "Гарри Поттер", "Фэнтези", 640, QUEST_HP),
            book("hp-8", "Гарри Поттер и Проклятое дитя", "Дж. К. Роулинг", "Гарри Поттер", "Фэнтези", 360, QUEST_HP),

            // Властелин колец (Фэнтези)
            book("lotr-1", "Братство Кольца", "Дж. Р. Р. Толкин", "Властелин колец", "Фэнтези", 512, QUEST_LOTR),
            book("lotr-2", "Две крепости", "Дж. Р. Р. Толкин", "Властелин колец", "Фэнтези", 448, QUEST_LOTR),
            book("lotr-3", "Возвращение короля", "Дж. Р. Р. Толкин", "Властелин колец", "Фэнтези", 464, QUEST_LOTR),

            // Хроники Нарнии (Сказки)
            book("nar-1", "Племянник чародея", "К. С. Льюис", "Хроники Нарнии", "Сказки, мифы и легенды", 208, QUEST_NARNIA),
            book("nar-2", "Лев, Колдунья и Платяной шкаф", "К. С. Льюис", "Хроники Нарнии", "Сказки, мифы и легенды", 208, QUEST_NARNIA),
            book("nar-3", "Конь и его мальчик", "К. С. Льюис", "Хроники Нарнии", "Сказки, мифы и легенды", 224, QUEST_NARNIA),
            book("nar-4", "Принц Каспиан", "К. С. Льюис", "Хроники Нарнии", "Сказки, мифы и легенды", 240, QUEST_NARNIA),
            book("nar-5", "Покоритель зари", "К. С. Льюис", "Хроники Нарнии", "Сказки, мифы и легенды", 256, QUEST_NARNIA),
            book("nar-6", "Серебряное кресло", "К. С. Льюис", "Хроники Нарнии", "Сказки, мифы и легенды", 256, QUEST_NARNIA),
            book("nar-7", "Последняя битва", "К. С. Льюис", "Хроники Нарнии", "Сказки, мифы и легенды", 192, QUEST_NARNIA),

            // Волшебник Изумрудного города (Сказки)
            book("em-1", "Волшебник Изумрудного города", "А. Волков", "Волшебник Изумрудного города", "Сказки, мифы и легенды", 224, QUEST_EMERALD),
            book("em-2", "Урфин Джюс и его деревянные солдаты", "А. Волков", "Волшебник Изумрудного города", "Сказки, мифы и легенды", 320, QUEST_EMERALD),
            book("em-3", "Семь подземных королей", "А. Волков", "Волшебник Изумрудного города", "Сказки, мифы и легенды", 288, QUEST_EMERALD),
            book("em-4", "Огненный бог Марранов", "А. Волков", "Волшебник Изумрудного города", "Сказки, мифы и легенды", 272, QUEST_EMERALD),
            book("em-5", "Желтый туман", "А. Волков", "Волшебник Изумрудного города", "Сказки, мифы и легенды", 304, QUEST_EMERALD),
            book("em-6", "Тайна заброшенного замка", "А. Волков", "Волшебник Изумрудного города", "Сказки, мифы и легенды", 272, QUEST_EMERALD),

            // Перси Джексон (Фэнтези)
            book("pj-1", "Похититель молний", "Р. Риордан", "Перси Джексон", "Фэнтези", 384, QUEST_PERCY),
            book("pj-2", "Море чудовищ", "Р. Риордан", "Перси Джексон", "Фэнтези", 320, QUEST_PERCY),
            book("pj-3", "Проклятие титана", "Р. Риордан", "Перси Джексон", "Фэнтези", 336, QUEST_PERCY),
            book("pj-4", "Лабиринт смерти", "Р. Риордан", "Перси Джексон", "Фэнтези", 384, QUEST_PERCY),
            book("pj-5", "Последнее пророчество", "Р. Риордан", "Перси Джексон", "Фэнтези", 416, QUEST_PERCY));

    private ReadingBookCatalog() {
    }

    private static CatalogBook book(String id, String name, String author, String series, String genre,
                                    int pages, String quest) {
        return new CatalogBook(id, name, author, series, genre, pages, quest);
    }

    /** Все заготовки каталога. */
    public static List<CatalogBook> all() {
        return BOOKS;
    }

    /** Заготовки серийного квеста (по groupKey достижения READING_QUEST_*). */
    public static List<CatalogBook> byQuest(String questGroupKey) {
        return BOOKS.stream().filter(b -> b.quest().equals(questGroupKey)).toList();
    }
}