package com.familymarket.dto;

import jakarta.validation.constraints.Min;

import java.util.List;

public record ChildLimitsUpdateRequest(
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer tvMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer pcMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer consoleMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer phoneMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer tabletMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer pocketWeekly,
        /** Выключенные стандартные типы лимитов (полный список; null — не менять). */
        List<String> disabledTypes,
        /** Кастомные лимиты (полный список, максимум 3; null — не менять). */
        List<CustomLimitInput> customLimits
) {
}
