package com.familymarket.dto;

import java.util.List;

/** Карточки дня ребёнка для родителя: карточки с задачами и ответами + прогресс дня. */
public record LogicCardAdminDayDto(
        List<LogicCardAdminDto> cards,
        int doneToday,
        int dailyLimit) {
}
