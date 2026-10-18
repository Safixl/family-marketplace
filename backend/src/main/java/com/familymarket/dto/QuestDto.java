package com.familymarket.dto;

import com.familymarket.quest.ChildQuestState;
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
        String basicDescription,
        String acceptDescription,
        Integer durationMinutes,
        Integer cooldownHours,
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
        Instant createdAt,
        String childStatus,
        Instant childStartsAt,
        Instant childNextAvailableAt) {

    public static QuestDto from(Quest quest) {
        return new QuestDto(
                quest.getId(),
                quest.getParent().getId(),
                quest.getChild() == null ? null : quest.getChild().getId(),
                quest.getType(),
                quest.getTitle(),
                quest.getDescription(),
                quest.getBasicDescription(),
                quest.getAcceptDescription(),
                quest.getDurationMinutes(),
                quest.getCooldownHours(),
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
                quest.getCreatedAt(),
                null,
                null,
                null);
    }

    /** Для ребёнка: квест + его состояние (стадия, таймер, время повторного взятия). */
    public static QuestDto from(Quest quest, ChildQuestState state) {
        QuestDto dto = from(quest);
        if (state == null) {
            return dto;
        }
        return new QuestDto(
                dto.id(), dto.parentId(), dto.childId(), dto.type(), dto.title(), dto.description(),
                dto.basicDescription(), dto.acceptDescription(), dto.durationMinutes(), dto.cooldownHours(),
                dto.icon(), dto.rewardStoreId(), dto.rewardStoreName(), dto.currencyName(), dto.currencyIcon(),
                dto.rewardAmount(), dto.xpReward(), dto.seasonalEventId(), dto.repeatable(), dto.active(),
                dto.createdAt(), state.getStatus(), state.getStartsAt(), state.getNextAvailableAt());
    }
}
