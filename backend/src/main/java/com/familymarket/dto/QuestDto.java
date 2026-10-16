package com.familymarket.dto;

import com.familymarket.quest.Quest;

import java.math.BigDecimal;
import java.time.Instant;

public record QuestDto(
        Long id,
        Long parentId,
        Long childId,
        String type,
        String title,
        String description,
        String icon,
        Long rewardStoreId,
        String rewardStoreName,
        String currencyName,
        String currencyIcon,
        BigDecimal rewardAmount,
        int xpReward,
        Long seasonalEventId,
        boolean repeatable,
        boolean active,
        Instant createdAt) {

    public static QuestDto from(Quest quest) {
        return new QuestDto(
                quest.getId(),
                quest.getParent().getId(),
                quest.getChild() == null ? null : quest.getChild().getId(),
                quest.getType(),
                quest.getTitle(),
                quest.getDescription(),
                quest.getIcon(),
                quest.getRewardStore() == null ? null : quest.getRewardStore().getId(),
                quest.getRewardStore() == null ? null : quest.getRewardStore().getName(),
                quest.getRewardStore() == null ? null : quest.getRewardStore().getCurrencyName(),
                quest.getRewardStore() == null ? null : quest.getRewardStore().getCurrencyIcon(),
                quest.getRewardAmount(),
                quest.getXpReward(),
                quest.getSeasonalEvent() == null ? null : quest.getSeasonalEvent().getId(),
                quest.isRepeatable(),
                quest.isActive(),
                quest.getCreatedAt());
    }
}
