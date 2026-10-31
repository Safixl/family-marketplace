package com.familymarket.dto;

import java.util.List;

/** День карточек языка ребёнка + сколько уже решено (лимит 3). */
public record LangCardDayDto(
        List<LangCardDto> cards,
        int doneToday,
        int dailyLimit) {
}
