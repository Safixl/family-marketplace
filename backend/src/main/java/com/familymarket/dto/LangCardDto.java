package com.familymarket.dto;

import com.familymarket.langcard.LangCard;
import com.familymarket.langcard.LangCardTask;
import com.familymarket.langcard.LangDifficulty;
import com.familymarket.langcard.LangTaskType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Карточка языка для фронтенда: задачи доступны после старта. */
public record LangCardDto(
        Long id,
        LocalDate date,
        LangTaskType taskType,
        String taskTypeLabel,
        String taskTypeEmoji,
        boolean manual,
        LangDifficulty difficulty,
        String difficultyLabel,
        int minutes,
        int baseReward,
        int multiplier,
        int maxReward,
        String status,
        Instant startedAt,
        Instant deadline,
        Instant submittedAt,
        Integer resultPercent,
        int xpEarned,
        String parentComment,
        List<LangCardTaskDto> tasks) {

    public static LangCardDto of(LangCard card, List<LangCardTask> tasks, boolean includeTasks) {
        List<LangCardTaskDto> taskDtos = includeTasks
                ? tasks.stream().map(LangCardTaskDto::of).toList()
                : List.of();
        int maxReward = card.getTaskType().isManual()
                ? card.getBaseReward() * 2
                : card.getBaseReward() + card.getTaskType().getTaskCount() * card.getDifficulty().getPerTaskXp();
        return new LangCardDto(
                card.getId(),
                card.getCardDate(),
                card.getTaskType(),
                card.getTaskType().getLabel(),
                card.getTaskType().getEmoji(),
                card.getTaskType().isManual(),
                card.getDifficulty(),
                card.getDifficulty().getLabel(),
                card.getMinutes(),
                card.getBaseReward(),
                card.getMultiplier(),
                maxReward,
                card.getStatus(),
                card.getStartedAt(),
                card.getDeadline(),
                card.getSubmittedAt(),
                card.getResultPercent(),
                card.getXpEarned(),
                card.getParentComment(),
                taskDtos);
    }
}
