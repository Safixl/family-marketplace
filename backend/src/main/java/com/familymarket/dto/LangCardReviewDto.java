package com.familymarket.dto;

import com.familymarket.langcard.LangCard;
import com.familymarket.langcard.LangCardTask;
import com.familymarket.langcard.LangTaskType;

import java.time.Instant;
import java.util.List;

/** Карточка языка на ручной проверке родителя (ответы ребёнка + кнопки множителя 0/1/2). */
public record LangCardReviewDto(
        Long cardId,
        Long childId,
        String childName,
        String childAvatar,
        LangTaskType taskType,
        String taskTypeLabel,
        String taskTypeEmoji,
        int minutes,
        int baseReward,
        List<String> taskTexts,
        List<String> childAnswers,
        Instant submittedAt) {

    public static LangCardReviewDto of(LangCard card, List<LangCardTask> tasks, List<String> childAnswers) {
        List<String> texts = tasks.stream().map(LangCardTask::getText).toList();
        return new LangCardReviewDto(
                card.getId(),
                card.getChild().getId(),
                card.getChild().getName(),
                card.getChild().getAvatarEmoji(),
                card.getTaskType(),
                card.getTaskType().getLabel(),
                card.getTaskType().getEmoji(),
                card.getMinutes(),
                card.getBaseReward(),
                texts,
                childAnswers,
                card.getSubmittedAt());
    }
}
