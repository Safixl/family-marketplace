package com.familymarket.mathcard;

/**
 * Уровни сложности карточек (6 уровней по ТЗ).
 * mode 0 — динамическая генерация по формулам; 1 — статичные олимпиадные шаблоны.
 * perExampleXp — XP в навык за каждый верный ответ примера;
 * successReward — награда за успешную карточку (≥80%), удваивается при 100%.
 */
public enum MathDifficulty {

    EASY("Легкий", "🟢", 30, 0, 1, 20),
    MEDIUM("Средний", "⚪", 35, 0, 2, 30),
    HIGH("Высокий", "🔵", 40, 0, 3, 45),
    HARD("Сложный", "🟣", 45, 0, 4, 60),
    EXTREME("Хард", "🔴", 50, 0, 5, 80),
    OLYMPIAD("Олимпиада", "🟠", 60, 1, 10, 120);

    private final String label;
    private final String emoji;
    private final int minutes;
    private final int mode;
    private final int perExampleXp;
    private final int successReward;

    MathDifficulty(String label, String emoji, int minutes, int mode, int perExampleXp, int successReward) {
        this.label = label;
        this.emoji = emoji;
        this.minutes = minutes;
        this.mode = mode;
        this.perExampleXp = perExampleXp;
        this.successReward = successReward;
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

    /** XP в навык «Математика» за каждый верный ответ (лёгкий 1 … олимпиада 10). */
    public int getPerExampleXp() {
        return perExampleXp;
    }

    /** Награда за успешную карточку (≥80% верных); при 100% удваивается. */
    public int getSuccessReward() {
        return successReward;
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