package com.familymarket.dto;

import java.math.BigDecimal;

/**
 * Состояние карманных денег ребёнка: недельный лимит, выдано за неделю, остаток.
 */
public record PocketState(
        int weeklyLimit,
        BigDecimal spentThisWeek,
        BigDecimal remaining
) {
}