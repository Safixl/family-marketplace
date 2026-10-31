package com.familymarket.dto;

/** Пункт настройки вида заданий языка: минуты и сложность. */
public record LangCardSettingItemRequest(String taskType, Integer minutes, String difficulty) {
}
