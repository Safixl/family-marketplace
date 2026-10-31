package com.familymarket.dto;

/** Ревью дейлика спорта родителем: множитель 0 (отклонить) / 1 / 2. */
public record SportReviewRequest(Integer multiplier, String comment) {
}
