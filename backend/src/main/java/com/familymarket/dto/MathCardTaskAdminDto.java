package com.familymarket.dto;

/**
 * Задача карточки для родителя: текст + правильный ответ (для контроля и перегенерации).
 * childAnswer/correct — последний ответ ребёнка (null, если задача ещё не решалась).
 */
public record MathCardTaskAdminDto(
        Long id,
        String topicCode,
        String taskType,
        String text,
        String answer,
        String childAnswer,
        Boolean correct) {
}
