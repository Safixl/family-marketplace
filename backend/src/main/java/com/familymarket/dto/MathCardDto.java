package com.familymarket.dto;

import com.familymarket.mathcard.MathCard;
import com.familymarket.mathcard.MathCardTask;
import com.familymarket.mathcard.MathDifficulty;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Сгенерированная карточка для фронтенда:
 * метаданные (описание, число задач, типы, таймер, награда XP), статус жизненного цикла
 * и задачи — только после старта (IN_PROGRESS) и для просмотра результата.
 */
public record MathCardDto(
        Long id,
        LocalDate date,
        String level,
        String levelLabel,
        String levelEmoji,
        int minutes,
        String description,
        int taskCount,
        List<String> taskTypes,
        int xpReward,
        String status,
        Instant startedAt,
        Instant deadline,
        Integer resultPercent,
        int xpEarned,
        List<MathCardTaskDto> tasks) {

    public static MathCardDto of(MathCard card, List<MathCardTask> taskList, boolean includeTasks) {
        MathDifficulty diff = MathDifficulty.valueOf(card.getFinalLevel());
        List<String> types = Arrays.stream(card.getTaskTypes().split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
        List<MathCardTaskDto> tasks = includeTasks
                ? taskList.stream()
                        .map(t -> new MathCardTaskDto(t.getId(), t.getTopicCode(), t.getTaskType(), t.getText()))
                        .toList()
                : List.of();
        return new MathCardDto(
                card.getId(),
                card.getCardDate(),
                card.getFinalLevel(),
                diff.getLabel(),
                diff.getEmoji(),
                card.getMinutes(),
                card.getDescription(),
                card.getTaskCount(),
                types,
                card.getXpReward(),
                card.getStatus(),
                card.getStartedAt(),
                card.getDeadline(),
                card.getResultPercent(),
                card.getXpEarned(),
                tasks);
    }
}