package com.familymarket.dto;

/** Задача логической карточки (без ответа — он не отдаётся ребёнку). */
public record LogicCardTaskDto(
        Long id,
        String topicCode,
        String taskType,
        String text) {
}
