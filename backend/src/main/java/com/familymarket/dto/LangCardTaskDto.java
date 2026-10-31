package com.familymarket.dto;

import com.familymarket.langcard.LangCardTask;
import com.familymarket.langcard.LangTaskType;

/** Задача карточки языка (без ответа). Для SECRET_STORIES ребёнок вводит две ячейки. */
public record LangCardTaskDto(
        Long id,
        LangTaskType taskType,
        String text) {

    public static LangCardTaskDto of(LangCardTask t) {
        return new LangCardTaskDto(t.getId(), t.getTaskType(), t.getText());
    }
}
