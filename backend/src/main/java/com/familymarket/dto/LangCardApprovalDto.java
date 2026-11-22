package com.familymarket.dto;

import com.familymarket.langcard.LangCard;
import com.familymarket.langcard.LangTaskType;

/** Карточка языка, ожидающая одобрения родителя. */
public record LangCardApprovalDto(
        Long cardId,
        Long childId,
        String childName,
        String childAvatar,
        LangTaskType taskType,
        String taskTypeLabel,
        String taskTypeEmoji,
        String difficultyLabel,
        int minutes,
        int baseReward,
        boolean manual) {

    public static LangCardApprovalDto of(LangCard card) {
        return new LangCardApprovalDto(
                card.getId(),
                card.getChild().getId(),
                card.getChild().getName(),
                card.getChild().getAvatarEmoji(),
                card.getTaskType(),
                card.getTaskType().getLabel(),
                card.getTaskType().getEmoji(),
                card.getDifficulty().getLabel(),
                card.getMinutes(),
                card.getBaseReward(),
                card.getTaskType().isManual());
    }
}
