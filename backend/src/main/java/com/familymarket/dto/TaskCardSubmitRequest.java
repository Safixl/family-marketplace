package com.familymarket.dto;

import java.util.List;

/** Ответы ребёнка на задания карточки (в том же порядке, что и задания). */
public record TaskCardSubmitRequest(List<String> answers) {
}