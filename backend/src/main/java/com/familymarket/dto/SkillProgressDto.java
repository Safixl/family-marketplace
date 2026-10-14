package com.familymarket.dto;

/**
 * Прогресс одного направления развития (навыка) для радарной диаграммы.
 * progress: 0..100 (заполнение гексагона от центра к краям).
 */
public record SkillProgressDto(
        String skill,
        String name,
        String icon,
        int progress,
        long xp,
        long unlockedAchievements) {
}
