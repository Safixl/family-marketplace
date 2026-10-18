package com.familymarket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public record ReadingSettingsUpdateRequest(
        @Min(value = 1, message = "Цель должна быть больше нуля") Integer pagesTarget,
        @DecimalMin(value = "0", message = "Награда не может быть отрицательной") BigDecimal rewardAmount,
        @Min(value = 0, message = "Опыт не может быть отрицательным") Integer xpReward
) {
}