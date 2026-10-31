package com.familymarket.dto;

/** Создание направления спорта/хобби родителем (по запросу ребёнка или по своей инициативе). */
public record SportDirectionCreateRequest(Long childId, String name, String icon, Long requestId) {
}
