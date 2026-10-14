package com.familymarket.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Достижение для ребенка: все ачивки родителя + прогресс выполнения и статус выдачи.
 */
public record ChildAchievementDto(Long id, String name, String description, String icon,
                                  BigDecimal rewardAmount, String targetType, int targetValue,
                                  long progress, boolean unlocked, Instant unlockedAt) {
}