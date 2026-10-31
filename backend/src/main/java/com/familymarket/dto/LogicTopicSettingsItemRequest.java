package com.familymarket.dto;

/** Пункт настройки темы логики: включена ли и базовый уровень сложности. */
public record LogicTopicSettingsItemRequest(Long topicId, Boolean active, String baseDifficulty) {
}
