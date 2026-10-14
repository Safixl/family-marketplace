package com.familymarket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ReadingBookUpsertRequest(
        @NotBlank(message = "Укажите название книги") @Size(max = 255, message = "Название слишком длинное") String name,
        @Size(max = 255, message = "Автор слишком длинный") String author,
        @Size(max = 255, message = "Серия слишком длинная") String series,
        @Size(max = 100, message = "Жанр слишком длинный") String genre,
        @Min(value = 0, message = "Страниц не может быть меньше 0") Integer pages,
        @DecimalMin(value = "0", message = "Множитель не может быть отрицательным") BigDecimal multiplier,
        Boolean active) {
}