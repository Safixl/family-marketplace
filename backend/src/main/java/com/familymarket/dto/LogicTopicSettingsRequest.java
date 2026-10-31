package com.familymarket.dto;

import java.util.List;

/** Сохранение настроек тем логики: список пунктов. */
public record LogicTopicSettingsRequest(List<LogicTopicSettingsItemRequest> items) {
}
