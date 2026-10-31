package com.familymarket.dto;

/** Результат отправки логической карточки на проверку. */
public record LogicCardSubmitResult(
        int percent,
        boolean success,
        int correct,
        int total,
        int perTaskXp,
        int successReward,
        int xpEarned) {
}
