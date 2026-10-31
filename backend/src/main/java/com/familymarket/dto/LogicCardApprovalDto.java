package com.familymarket.dto;

import com.familymarket.logiccard.LogicCard;
import com.familymarket.logiccard.LogicDifficulty;

/** Логическая карточка, ожидающая одобрения родителя. */
public record LogicCardApprovalDto(
        Long cardId,
        Long childId,
        String childName,
        String childAvatar,
        String level,
        String levelLabel,
        String levelEmoji,
        int minutes,
        int taskCount,
        int xpReward) {

    public static LogicCardApprovalDto of(LogicCard card) {
        LogicDifficulty diff = LogicDifficulty.valueOf(card.getFinalLevel());
        return new LogicCardApprovalDto(
                card.getId(),
                card.getChild().getId(),
                card.getChild().getName(),
                card.getChild().getAvatarEmoji(),
                card.getFinalLevel(),
                diff.getLabel(),
                diff.getEmoji(),
                card.getMinutes(),
                card.getTaskCount(),
                card.getXpReward());
    }
}
