package com.familymarket.dto;

import java.util.List;

/** Черновик ответов ребёнка (по порядку задач) для анти-читинга. */
public record CardAnswersRequest(List<String> answers) {
}
