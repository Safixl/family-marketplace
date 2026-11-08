package com.familymarket.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Ввод кастомного лимита от родителя: id существующего слота (C1..C3) или null —
 * тогда сервер подберёт свободный слот.
 */
public record CustomLimitInput(
        String id,
        @NotBlank(message = "Укажите название лимита")
        @Size(max = 40, message = "Название лимита — до 40 символов")
        String name,
        @Min(value = 0, message = "Лимит не может быть отрицательным") Integer minutes,
        Boolean enabled
) {
}
