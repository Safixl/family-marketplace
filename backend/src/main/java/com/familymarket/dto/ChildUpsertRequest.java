package com.familymarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChildUpsertRequest(
        @NotBlank(message = "Укажите имя ребенка") @Size(max = 100, message = "Имя слишком длинное") String name,
        @Size(max = 16, message = "Эмодзи слишком длинный") String avatarEmoji,
        Boolean active) {
}