package com.familymarket.dto;

/** Ревью ручного задания родителем: множитель 0 (отклонить) / 1 (зачесть) / 2 (зачесть ×2). */
public record LangCardReviewRequest(Integer multiplier, String comment) {
}
