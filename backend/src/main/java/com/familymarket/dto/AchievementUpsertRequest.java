package com.familymarket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AchievementUpsertRequest(
        @NotBlank(message = "Укажите название достижения") @Size(max = 150, message = "Название слишком длинное") String name,
        @Size(max = 2000, message = "Описание слишком длинное") String description,
        @Size(max = 64, message = "Иконка слишком длинная") String icon,
        @DecimalMin(value = "0", message = "Награда не может быть отрицательной") BigDecimal rewardAmount,
        @Size(max = 32, message = "Тип цели слишком длинный") String targetType,
        Integer targetValue,
        @Size(max = 64, message = "Ключ группы слишком длинный") String groupKey,
        @Size(max = 32, message = "Навык слишком длинный") String skill,
        Integer level,
        Boolean hiddenReward,
        Long rewardStoreId) {
}
