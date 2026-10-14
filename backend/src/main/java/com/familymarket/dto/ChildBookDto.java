package com.familymarket.dto;

import java.math.BigDecimal;

/**
 * Книга для ребёнка: рекомендация родителя + статус чтения.
 * status: null — не читал, PENDING — ждёт подтверждения, APPROVED — зачтено.
 */
public record ChildBookDto(Long id, String name, String author, String series, String genre,
                           int pages, BigDecimal multiplier, String status) {
}