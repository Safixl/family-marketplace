package com.familymarket.dto;

import jakarta.validation.constraints.Min;

public record ChildLimitsUpdateRequest(
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer tvMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer pcMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer consoleMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer phoneMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer tabletMinutes,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer pocketWeekly
) {
}