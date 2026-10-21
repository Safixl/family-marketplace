package com.familymarket.dto;

/** Результат проверки ответа на задачу карточки. */
public record MathCardAnswerResult(
        boolean correct,
        String expected) {
}