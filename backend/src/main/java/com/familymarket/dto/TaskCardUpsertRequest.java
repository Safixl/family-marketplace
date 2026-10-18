package com.familymarket.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record TaskCardUpsertRequest(
        @NotBlank(message = "Укажите направление") String skill,
        @NotBlank(message = "Укажите название") String title,
        String description,
        String icon,
        String difficulty,
        @NotEmpty(message = "Добавьте хотя бы одно задание") List<TaskItem> tasks,
        @NotNull(message = "Укажите время на выполнение") @Min(value = 1, message = "Время должно быть больше нуля") Integer durationMinutes,
        BigDecimal rewardAmount,
        Long rewardStoreId,
        Integer xpReward,
        @Min(value = 0, message = "Бонус не может быть отрицательным") Integer houseBonus,
        String rarity,
        Boolean hiddenReward,
        @Min(value = 1, message = "Порог должен быть от 1 до 100") Integer successPercent,
        Boolean active,
        Long childId
) {
}