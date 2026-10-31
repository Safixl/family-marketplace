package com.familymarket.dto;

import com.familymarket.logiccard.LogicCard;
import com.familymarket.logiccard.LogicCardTask;
import com.familymarket.logiccard.LogicDifficulty;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Сгенерированная логическая карточка для фронтенда:
 * метаданные (описание, число задач, типы, таймер, награда XP), статус жизненного цикла
 * и задачи — только после старта (IN_PROGRESS) и для просмотра результата.
 */
public record LogicCardDto(
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
        int maxIqReward,
        String status,
        Instant startedAt,
        Instant deadline,
        Integer resultPercent,
        int xpEarned,
        List<LogicCardTaskDto> tasks) {

    public static LogicCardDto of(LogicCard card, List<LogicCardTask> taskList, boolean includeTasks) {
        LogicDifficulty diff = LogicDifficulty.valueOf(card.getFinalLevel());
        List<String> types = Arrays.stream(card.getTaskTypes().split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
        List<LogicCardTaskDto> tasks = includeTasks
                ? taskList.stream()
                        .map(t -> new LogicCardTaskDto(t.getId(), t.getTopicCode(), t.getTaskType(), t.getText()))
                        .toList()
                : List.of();
        // Максимум «IQ-коинов» за карточку: все задачи верно (по уровню) + награда за 100%
        int maxIq = card.getTaskCount() * diff.getPerExampleXp() + diff.getSuccessReward() * 2;
        return new LogicCardDto(
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
                maxIq,
                card.getStatus(),
                card.getStartedAt(),
                card.getDeadline(),
                card.getResultPercent(),
                card.getXpEarned(),
                tasks);
    }
}
