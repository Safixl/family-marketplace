package com.familymarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ChildUpsertRequest(
        @NotBlank(message = "Укажите имя ребенка") @Size(max = 100, message = "Имя слишком длинное") String name,
        String avatarEmoji,
        Boolean active,
        /** Дата рождения: возраст вычисляется автоматически. */
        LocalDate birthDate
) {
}
