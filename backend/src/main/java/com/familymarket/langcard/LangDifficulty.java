package com.familymarket.langcard;

/**
 * Сложность заданий языка, которую настраивает родитель для каждого вида задач.
 * Влияет на: какие слова попадаются (по difficulty_level словаря) и размер награды.
 */
public enum LangDifficulty {

    EASY("Легкая", "🟢", 1, 2, 1, 5),
    MEDIUM("Обычная", "⚪", 3, 4, 2, 10),
    HARD("Сложная", "🔴", 5, 6, 3, 15);

    private final String label;
    private final String emoji;
    private final int minWordLevel;
    private final int maxWordLevel;
    private final int perTaskXp;
    private final int successReward;

    LangDifficulty(String label, String emoji, int minWordLevel, int maxWordLevel, int perTaskXp, int successReward) {
        this.label = label;
        this.emoji = emoji;
        this.minWordLevel = minWordLevel;
        this.maxWordLevel = maxWordLevel;
        this.perTaskXp = perTaskXp;
        this.successReward = successReward;
    }

    public String getLabel() {
        return label;
    }

    public String getEmoji() {
        return emoji;
    }

    /** Диапазон difficulty_level слов словаря для этой сложности. */
    public int getMinWordLevel() {
        return minWordLevel;
    }

    public int getMaxWordLevel() {
        return maxWordLevel;
    }

    /** XP за каждую верную задачу. */
    public int getPerTaskXp() {
        return perTaskXp;
    }

    /** Награда за успешную карточку (≥80%). */
    public int getSuccessReward() {
        return successReward;
    }

    public static LangDifficulty parse(String value) {
        try {
            return LangDifficulty.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Недопустимая сложность: " + value);
        }
    }
}
