package com.familymarket.dto;

import com.familymarket.logiccard.LogicTopic;
import com.familymarket.logiccard.LogicTopicSettings;

/** Тема логики + настройки родителя (тумблер Active и базовая сложность). */
public record LogicTopicDto(
        Long id,
        String code,
        String name,
        String gradeLabel,
        boolean active,
        String baseDifficulty) {

    public static LogicTopicDto of(LogicTopic topic, LogicTopicSettings settings) {
        return new LogicTopicDto(
                topic.getId(),
                topic.getCode(),
                topic.getName(),
                topic.getGradeLabel(),
                settings != null && settings.isActive(),
                settings == null ? "MEDIUM" : settings.getBaseDifficulty());
    }
}
