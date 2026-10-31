package com.familymarket.dto;

import java.util.List;

/** Сохранение настроек видов заданий языка: список пунктов. */
public record LangCardSettingsSaveRequest(List<LangCardSettingItemRequest> items) {
}
