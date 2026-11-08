package com.familymarket.dto;

/**
 * Кастомный лимит ребёнка: id слота C1..C3, название, минуты в день, включён/выключен.
 */
public record CustomLimitDto(
        String id,
        String name,
        int minutes,
        boolean enabled
) {
}
