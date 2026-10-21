package com.familymarket.dto;

import com.familymarket.mathcard.MathCard;
import com.familymarket.mathcard.MathCardTask;
import com.familymarket.mathcard.MathDifficulty;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Сгенерированная карточка с метаданными для фронтенда:
 * описание, число задач, типы задач, таймер (минуты) и сами задачи.
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
        List<MathCardTaskDto> tasks) {

    public static MathCardDto of(MathCard card, List<MathCardTask> taskList) {
        MathDifficulty diff = MathDifficulty.valueOf(card.getFinalLevel());
        List<String> types = Arrays.stream(card.getTaskTypes().split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
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
                taskList.stream()
                        .map(t -> new MathCardTaskDto(t.getId(), t.getTopicCode(), t.getTaskType(), t.getText()))
                        .toList());
    }
}