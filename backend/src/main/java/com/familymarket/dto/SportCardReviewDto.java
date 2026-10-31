package com.familymarket.dto;

import com.familymarket.sport.SportCard;
import com.familymarket.sport.SportCardTask;

import java.time.Instant;
import java.util.List;

/** Дейлик спорта на проверке родителя. */
public record SportCardReviewDto(
        Long cardId,
        Long childId,
        String childName,
        String childAvatar,
        String directionName,
        String directionIcon,
        int baseReward,
        List<String> taskTitles,
        Instant submittedAt) {

    public static SportCardReviewDto of(SportCard card, List<SportCardTask> tasks) {
        return new SportCardReviewDto(
                card.getId(),
                card.getChild().getId(),
                card.getChild().getName(),
                card.getChild().getAvatarEmoji(),
                card.getDirection().getName(),
                card.getDirection().getIcon(),
                card.getBaseReward(),
                tasks.stream().map(SportCardTask::getTitle).toList(),
                card.getSubmittedAt());
    }
}
