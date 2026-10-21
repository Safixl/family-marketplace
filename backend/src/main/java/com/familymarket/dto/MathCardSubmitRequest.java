package com.familymarket.dto;

import java.util.List;

/** Ответы ребёнка на задачи карточки (по порядку задач). */
public record MathCardSubmitRequest(List<String> answers) {
}