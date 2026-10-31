package com.familymarket.dto;

/**
 * Результат сдачи карточки языка.
 * sentToParent=true — ручное задание ушло родителю на проверку (награда появится после ревью).
 */
public record LangCardSubmitResult(
        int percent,
        boolean success,
        int correct,
        int total,
        int perTaskXp,
        int successReward,
        int xpEarned,
        boolean sentToParent) {
}
