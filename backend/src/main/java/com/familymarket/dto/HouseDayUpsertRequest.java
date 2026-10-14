package com.familymarket.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record HouseDayUpsertRequest(
        @NotNull(message = "Укажите ребенка") Long childId,
        @NotNull(message = "Укажите дату") LocalDate day,
        @Min(value = -2, message = "Оценка комнаты от -2 до +2") @Max(value = 2, message = "Оценка комнаты от -2 до +2") Integer roomScore,
        @Min(value = -3, message = "Оценка помощи от -3 до +6") @Max(value = 6, message = "Оценка помощи от -3 до +6") Integer livingScore) {
}