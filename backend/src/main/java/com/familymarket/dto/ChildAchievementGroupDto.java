package com.familymarket.dto;

import java.math.BigDecimal;

/**
 * Достижение для ребёнка по группам уровней.
 * Ребёнок видит только ближайший (текущий) уровень группы, а не все уровни.
 */
public record ChildAchievementGroupDto(
        Long achievementId,
        String name,
        String description,
        String icon,
        String targetType,
        int targetValue,
        long progress,
        String levelName,
        String skill,
        int level,
        BigDecimal rewardAmount,
        boolean hiddenReward,
        boolean unlocked,
        boolean completed) {
}
