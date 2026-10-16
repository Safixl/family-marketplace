package com.familymarket.dto;

/**
 * Общий уровень персонажа: 50% опыта навыков + опыт ачивок + опыт квестов.
 */
public record LevelDto(long xp, int level, long xpInLevel, long xpToNext, double ratio, String rank, String rankEmoji) {
}
