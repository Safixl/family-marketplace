package com.familymarket.dto;

import java.util.List;

/** Ответы ребёнка на задачи карточки языка (по порядку). Для SECRET_STORIES формат "en|ru". */
public record LangCardSubmitRequest(List<String> answers) {
}
