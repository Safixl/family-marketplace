package com.familymarket.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReadingLogCreateRequest(
        @NotNull(message = "Укажите ребенка") Long childId,
        @NotNull(message = "Укажите книгу") Long bookId,
        LocalDate readAt) {
}