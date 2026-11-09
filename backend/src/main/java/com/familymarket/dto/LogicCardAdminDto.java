package com.familymarket.dto;

import com.familymarket.logiccard.LogicCard;
import com.familymarket.logiccard.LogicCardAttempt;
import com.familymarket.logiccard.LogicCardTask;
import com.familymarket.logiccard.LogicDifficulty;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Карточка для родителя: метаданные + задачи с ответами (независимо от статуса)
 * и последними ответами ребёнка. Используется во вкладке «Логика»
 * для просмотра, перегенерации и проверки результатов.
 */
public record LogicCardAdminDto(
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
        List<LogicCardTaskAdminDto> tasks) {

    public static LogicCardAdminDto of(LogicCard card, List<LogicCardTask> taskList) {
        return of(card, taskList, Map.of());
    }

    public static LogicCardAdminDto of(LogicCard card, List<LogicCardTask> taskList, Map<Long, LogicCardAttempt> lastAttempts) {
        LogicDifficulty diff = LogicDifficulty.valueOf(card.getFinalLevel());
        List<String> types = Arrays.stream(card.getTaskTypes().split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
        List<LogicCardTaskAdminDto> tasks = taskList.stream()
                .map(t -> {
                    LogicCardAttempt attempt = lastAttempts.get(t.getId());
                    return new LogicCardTaskAdminDto(
                            t.getId(),
                            t.getTopicCode(),
                            t.getTaskType(),
                            t.getText(),
                            t.getAnswer(),
                            attempt == null ? null : attempt.getAnswer(),
                            attempt == null ? null : attempt.isCorrect());
                })
                .toList();
        int maxIqReward = card.getTaskCount() * diff.getPerExampleXp() + diff.getSuccessReward() * 2;
        return new LogicCardAdminDto(
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
                maxIqReward,
                card.getStatus(),
                card.getStartedAt(),
                card.getDeadline(),
                card.getResultPercent(),
                card.getXpEarned(),
                tasks);
    }
}
