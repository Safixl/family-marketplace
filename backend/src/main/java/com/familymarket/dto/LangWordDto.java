package com.familymarket.dto;

/**
 * Карточка слова для языкового дейлика. id — ключ слова (серверный), learned — выучено сегодня.
 */
public record LangWordDto(String id, String word, String translation, boolean learned) {
}
