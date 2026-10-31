package com.familymarket.dto;

/** Запрос ребёнка на новое направление спорта/хобби. */
public record SportRequestCreateRequest(String name, String comment) {
}
