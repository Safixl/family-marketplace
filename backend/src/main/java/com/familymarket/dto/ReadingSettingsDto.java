package com.familymarket.dto;

import java.math.BigDecimal;

/** Настройки дейлика чтения (родитель): страниц в день и награда. */
public record ReadingSettingsDto(
        Long childId,
        Long storeId,
        int pagesTarget,
        BigDecimal rewardAmount,
        int xpReward
) {
}