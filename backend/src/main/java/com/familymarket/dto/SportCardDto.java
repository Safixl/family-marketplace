package com.familymarket.dto;

import com.familymarket.sport.SportCard;
import com.familymarket.sport.SportCardTask;

import java.time.Instant;
import java.util.List;

/** Дейлик-карточка спорта: упражнения и статус проверки родителем. */
public record SportCardDto(
        Long id,
        Long directionId,
        String directionName,
        String directionIcon,
        String status,
        int baseReward,
        int multiplier,
        int maxReward,
        int xpEarned,
        String parentComment,
        Instant submittedAt,
        List<String> taskTitles,
        List<String> taskDescriptions) {

    public static SportCardDto of(SportCard card, List<SportCardTask> tasks) {
        return new SportCardDto(
                card.getId(),
                card.getDirection().getId(),
                card.getDirection().getName(),
                card.getDirection().getIcon(),
                card.getStatus(),
                card.getBaseReward(),
                card.getMultiplier(),
                card.getBaseReward() * 2,
                card.getXpEarned(),
                card.getParentComment(),
                card.getSubmittedAt(),
                tasks.stream().map(SportCardTask::getTitle).toList(),
                tasks.stream().map(t -> t.getDescription() == null ? "" : t.getDescription()).toList());
    }
}
