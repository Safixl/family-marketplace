package com.familymarket.dto;

/** Создание/редактирование задания направления. */
public record SportTaskUpsertRequest(Long directionId, String title, String description,
                                     Integer gradeMin, Integer gradeMax) {
}
