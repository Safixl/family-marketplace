package com.familymarket.mathcard;

/**
 * Уровни сложности карточек (6 уровней по ТЗ).
 * mode 0 — динамическая генерация по формулам; 1 — статичные олимпиадные шаблоны.
 */
public enum MathDifficulty {

    EASY("Легкий", "🟢", 30, 0),
    MEDIUM("Средний", "⚪", 35, 0),
    HIGH("Высокий", "🔵", 40, 0),
    HARD("Сложный", "🟣", 45, 0),
    EXTREME("Хард", "🔴", 50, 0),
    OLYMPIAD("Олимпиада", "🟠", 60, 1);

    private final String label;
    private final String emoji;
    private final int minutes;
    private final int mode;

    MathDifficulty(String label, String emoji, int minutes, int mode) {
        this.label = label;
        this.emoji = emoji;
        this.minutes = minutes;
        this.mode = mode;
    }

    public String getLabel() {
        return label;
    }

    public String getEmoji() {
        return emoji;
    }

    public int getMinutes() {
        return minutes;
    }

    /** 0 — динамические формулы, 1 — статичные олимпиадные шаблоны. */
    public int getMode() {
        return mode;
    }

    /**
     * Итоговый уровень карточки по пересечению выбора ребёнка и базового уровня родителя.
     * «Обычная» → базовый уровень родителя; «Сложная» → +1 ступень (потолок «Сложный»);
     * «Легкая» → самый простой; «Высокая» → не ниже «Высокий»; «Хард»/«Олимпиада» изолированы.
     */
    public static MathDifficulty resolve(MathDifficulty parentBase, String childChoice) {
        MathDifficulty choice = MathDifficulty.valueOf(childChoice);
        return switch (choice) {
            case EASY -> EASY;
            case MEDIUM -> parentBase;
            case HIGH -> parentBase.ordinal() > HIGH.ordinal() ? parentBase : HIGH;
            case HARD -> {
                int next = parentBase.ordinal() + 1;
                yield next >= HARD.ordinal() ? HARD : values()[next];
            }
            case EXTREME -> EXTREME;
            case OLYMPIAD -> OLYMPIAD;
        };
    }
}