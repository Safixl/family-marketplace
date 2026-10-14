package com.familymarket.dto;

import jakarta.validation.constraints.NotNull;

public record GrantAchievementRequest(
        @NotNull(message = "Укажите ребенка") Long childId,
        @NotNull(message = "Укажите достижение") Long achievementId,
        Long storeId) {
}