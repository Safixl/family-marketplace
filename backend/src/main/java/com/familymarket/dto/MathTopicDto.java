package com.familymarket.dto;

import com.familymarket.mathcard.MathTopic;
import com.familymarket.mathcard.MathTopicSettings;

/** Тема математики + настройки родителя (тумблер Active и базовая сложность). */
public record MathTopicDto(
        Long id,
        String code,
        String name,
        String gradeLabel,
        boolean active,
        String baseDifficulty) {

    public static MathTopicDto of(MathTopic topic, MathTopicSettings settings) {
        return new MathTopicDto(
                topic.getId(),
                topic.getCode(),
                topic.getName(),
                topic.getGradeLabel(),
                settings != null && settings.isActive(),
                settings == null ? "MEDIUM" : settings.getBaseDifficulty());
    }
}