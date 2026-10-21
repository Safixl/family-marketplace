package com.familymarket.dto;

/** Задача карточки (ответ ребёнку не отдаётся). */
public record MathCardTaskDto(
        Long id,
        String topicCode,
        String taskType,
        String text) {
}