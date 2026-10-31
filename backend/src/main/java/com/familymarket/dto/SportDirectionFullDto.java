package com.familymarket.dto;

import com.familymarket.sport.SportDirection;

/** Направление + задания (для редактора родителя). */
public record SportDirectionFullDto(
        Long id,
        Long childId,
        String name,
        String icon,
        String status,
        int taskCount) {

    public static SportDirectionFullDto of(SportDirection d, int taskCount) {
        return new SportDirectionFullDto(d.getId(), d.getChild().getId(), d.getName(), d.getIcon(),
                d.getStatus(), taskCount);
    }
}
