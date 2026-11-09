package com.familymarket.dto;

import com.familymarket.mathcard.MathCard;
import com.familymarket.mathcard.MathCardAttempt;
import com.familymarket.mathcard.MathCardTask;
import com.familymarket.mathcard.MathDifficulty;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Карточка для родителя: метаданные + задачи с ответами (независимо от статуса)
 * и последними ответами ребёнка. Используется во вкладке «Математика»
 * для просмотра, перегенерации и проверки результатов.
 */
public record MathCardAdminDto(
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
        int maxMatrixReward,
        String status,
        Instant startedAt,
        Instant deadline,
        Integer resultPercent,
        int xpEarned,
        List<MathCardTaskAdminDto> tasks) {

    public static MathCardAdminDto of(MathCard card, List<MathCardTask> taskList) {
        return of(card, taskList, Map.of());
    }

    public static MathCardAdminDto of(MathCard card, List<MathCardTask> taskList, Map<Long, MathCardAttempt> lastAttempts) {
        MathDifficulty diff = MathDifficulty.valueOf(card.getFinalLevel());
        List<String> types = Arrays.stream(card.getTaskTypes().split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
        List<MathCardTaskAdminDto> tasks = taskList.stream()
                .map(t -> {
                    MathCardAttempt attempt = lastAttempts.get(t.getId());
                    return new MathCardTaskAdminDto(
                            t.getId(),
                            t.getTopicCode(),
                            t.getTaskType(),
                            t.getText(),
                            t.getAnswer(),
                            attempt == null ? null : attempt.getAnswer(),
                            attempt == null ? null : attempt.isCorrect());
                })
                .toList();
        int maxMatrix = card.getTaskCount() * diff.getPerExampleXp() + diff.getSuccessReward() * 2;
        return new MathCardAdminDto(
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
                maxMatrix,
                card.getStatus(),
                card.getStartedAt(),
                card.getDeadline(),
                card.getResultPercent(),
                card.getXpEarned(),
                tasks);
    }
}
