package com.familymarket.dto;

import com.familymarket.sport.SportTask;

/** Задание направления (родитель редактирует текст, диапазон классов). */
public record SportTaskDto(
        Long id,
        Long directionId,
        String title,
        String description,
        int gradeMin,
        int gradeMax,
        int sortOrder) {

    public static SportTaskDto of(SportTask t) {
        return new SportTaskDto(
                t.getId(),
                t.getDirection().getId(),
                t.getTitle(),
                t.getDescription() == null ? "" : t.getDescription(),
                t.getGradeMin(),
                t.getGradeMax(),
                t.getSortOrder());
    }
}
