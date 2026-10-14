package com.familymarket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MathTaskUpsertRequest(
        @NotBlank(message = "Укажите название задачи") @Size(max = 255, message = "Название слишком длинное") String title,
        @Size(max = 2000, message = "Описание слишком длинное") String description,
        @NotBlank(message = "Укажите правильный ответ") @Size(max = 255, message = "Ответ слишком длинный") String answer,
        @DecimalMin(value = "0", message = "Баллы не могут быть отрицательными") BigDecimal points,
        Boolean active) {
}