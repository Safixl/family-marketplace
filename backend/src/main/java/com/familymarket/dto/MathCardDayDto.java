package com.familymarket.dto;

import java.util.List;

/** День карточек ребёнка: отсортированные по сложности карты + сколько уже решено (лимит 3). */
public record MathCardDayDto(
        List<MathCardDto> cards,
        int doneToday,
        int dailyLimit) {
}