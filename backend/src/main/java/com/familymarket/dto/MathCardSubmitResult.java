package com.familymarket.dto;

/** Результат отправки карточки на проверку. */
public record MathCardSubmitResult(
        int percent,
        boolean success,
        int correct,
        int total,
        int perExampleXp,
        int successReward,
        int xpEarned) {
}