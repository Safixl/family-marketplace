package com.familymarket.langcard;

/**
 * 6 видов заданий навыка «Иностранный язык» (вместо уровней сложности).
 * manual = true — проверяет родитель (множитель 0/1/2), false — автопроверка.
 * taskCount — сколько задач генерируется в карточке; minutes — значение по умолчанию.
 */
public enum LangTaskType {

    WORD_WALL("Стена слов", "🧱", false, 10, 20),
    SECRET_STORIES("Тайные истории", "📜", false, 5, 25),
    DECODE("Расшифруй послание", "🔐", true, 1, 20),
    SPELLING("А оно точно так пишется", "✏️", false, 10, 20),
    SHARE_SECRET("Поделись секретом", "🤫", true, 2, 15),
    MASTERY("Покажи своё мастерство", "🏆", true, 2, 15);

    private final String label;
    private final String emoji;
    private final boolean manual;
    private final int taskCount;
    private final int defaultMinutes;

    LangTaskType(String label, String emoji, boolean manual, int taskCount, int defaultMinutes) {
        this.label = label;
        this.emoji = emoji;
        this.manual = manual;
        this.taskCount = taskCount;
        this.defaultMinutes = defaultMinutes;
    }

    public String getLabel() {
        return label;
    }

    public String getEmoji() {
        return emoji;
    }

    /** true — задание проверяет родитель с множителем 0/1/2. */
    public boolean isManual() {
        return manual;
    }

    /** Число задач в карточке по умолчанию. */
    public int getTaskCount() {
        return taskCount;
    }

    /** Время на карточку по умолчанию (мин), может быть переопределено родителем. */
    public int getDefaultMinutes() {
        return defaultMinutes;
    }

    public static LangTaskType parse(String value) {
        try {
            return LangTaskType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Неизвестный вид задания: " + value);
        }
    }
}
