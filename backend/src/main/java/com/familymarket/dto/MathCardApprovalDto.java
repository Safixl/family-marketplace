package com.familymarket.dto;

import com.familymarket.mathcard.MathCard;
import com.familymarket.mathcard.MathDifficulty;

/** Карточка, ожидающая одобрения родителя. */
public record MathCardApprovalDto(
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

    public static MathCardApprovalDto of(MathCard card) {
        MathDifficulty diff = MathDifficulty.valueOf(card.getFinalLevel());
        return new MathCardApprovalDto(
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