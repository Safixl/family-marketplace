package com.familymarket.dto;

import java.util.List;

/** Ответы ребёнка на задачи логической карточки (по порядку задач). */
public record LogicCardSubmitRequest(List<String> answers) {
}
