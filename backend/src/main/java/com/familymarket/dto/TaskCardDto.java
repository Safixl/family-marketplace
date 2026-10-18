package com.familymarket.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record TaskCardDto(
        Long id,
        Long childCardId,
        String skill,
        String title,
        String description,
        String icon,
        String difficulty,
        List<TaskItem> tasks,
        int durationMinutes,
        BigDecimal rewardAmount,
        Long rewardStoreId,
        String currencyName,
        String currencyIcon,
        int xpReward,
        int houseBonus,
        String rarity,
        boolean hiddenReward,
        int successPercent,
        boolean active,
        String childStatus,
        Instant startedAt,
        Integer resultPercent
) {
}