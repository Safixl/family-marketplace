package com.familymarket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductUpsertRequest(
        @NotBlank(message = "Укажите название товара") @Size(max = 150, message = "Название слишком длинное") String name,
        @Size(max = 2000, message = "Описание слишком длинное") String description,
        @NotNull(message = "Укажите цену") @DecimalMin(value = "0.01", message = "Цена должна быть больше нуля") BigDecimal price,
        @Min(value = 1, message = "Лимит должен быть положительным") Integer limitPerChild,
        Boolean active,
        String effectType,
        String effectLimit,
        @Min(value = 0, message = "Величина эффекта не может быть отрицательной") Integer effectValue) {
}