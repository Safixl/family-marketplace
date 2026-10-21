package com.familymarket.dto;

import java.util.List;

/** Сохранение настроек тем родителя (тумблеры + базовая сложность). */
public record MathTopicSettingsRequest(List<MathTopicSettingsItemRequest> items) {
}