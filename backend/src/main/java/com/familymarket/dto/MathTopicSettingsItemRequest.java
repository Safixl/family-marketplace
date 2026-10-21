package com.familymarket.dto;

/** Пункт настройки темы: включена ли и базовый уровень сложности. */
public record MathTopicSettingsItemRequest(Long topicId, Boolean active, String baseDifficulty) {
}