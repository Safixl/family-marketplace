package com.familymarket.dto;

import com.familymarket.langcard.LangCardSetting;

/** Настройка вида заданий языка: время и сложность. */
public record LangCardSettingDto(
        String taskType,
        String label,
        String emoji,
        boolean manual,
        int minutes,
        String difficulty) {

    public static LangCardSettingDto of(LangCardSetting s) {
        return new LangCardSettingDto(
                s.getTaskType().name(),
                s.getTaskType().getLabel(),
                s.getTaskType().getEmoji(),
                s.getTaskType().isManual(),
                s.getMinutes(),
                s.getDifficulty().name());
    }
}
