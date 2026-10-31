package com.familymarket.dto;

import com.familymarket.sport.SportDirection;

/** Направление спорта/хобби; isToday — выбрано ли оно для дейлика сегодня. */
public record SportDirectionDto(
        Long id,
        String name,
        String icon,
        boolean isToday) {

    public static SportDirectionDto of(SportDirection d, boolean isToday) {
        return new SportDirectionDto(d.getId(), d.getName(), d.getIcon(), isToday);
    }
}
