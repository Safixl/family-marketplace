package com.familymarket.dto;

import java.math.BigDecimal;

public record QuestUpsertRequest(
        Long childId,
        String type,
        String title,
        String description,
        String icon,
        Long rewardStoreId,
        BigDecimal rewardAmount,
        Integer xpReward,
        Long seasonalEventId,
        Boolean repeatable,
        Boolean active) {
}
