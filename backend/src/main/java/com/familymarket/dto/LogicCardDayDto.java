package com.familymarket.dto;

import java.util.List;

/** День логик-карточек ребёнка: отсортированные по сложности карты + сколько уже решено (лимит 3). */
public record LogicCardDayDto(
        List<LogicCardDto> cards,
        int doneToday,
        int dailyLimit) {
}
