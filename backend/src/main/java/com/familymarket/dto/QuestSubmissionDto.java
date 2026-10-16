package com.familymarket.dto;

import com.familymarket.quest.QuestSubmission;

import java.math.BigDecimal;
import java.time.Instant;

public record QuestSubmissionDto(
        Long id,
        Long questId,
        String questTitle,
        String questIcon,
        String questType,
        Long childId,
        String childName,
        String childAvatar,
        String status,
        String comment,
        String photoUrl,
        BigDecimal rewardAmount,
        String currencyName,
        String currencyIcon,
        int xpReward,
        Long seasonalEventId,
        Instant createdAt,
        Instant resolvedAt) {

    public static QuestSubmissionDto from(QuestSubmission submission) {
        return new QuestSubmissionDto(
                submission.getId(),
                submission.getQuest().getId(),
                submission.getQuest().getTitle(),
                submission.getQuest().getIcon(),
                submission.getQuest().getType(),
                submission.getChild().getId(),
                submission.getChild().getName(),
                submission.getChild().getAvatarEmoji(),
                submission.getStatus(),
                submission.getComment(),
                submission.getPhotoUrl(),
                submission.getQuest().getRewardAmount(),
                submission.getQuest().getRewardStore() == null ? null : submission.getQuest().getRewardStore().getCurrencyName(),
                submission.getQuest().getRewardStore() == null ? null : submission.getQuest().getRewardStore().getCurrencyIcon(),
                submission.getQuest().getXpReward(),
                submission.getQuest().getSeasonalEvent() == null ? null : submission.getQuest().getSeasonalEvent().getId(),
                submission.getCreatedAt(),
                submission.getResolvedAt());
    }
}
