package com.familymarket.common;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

/**
 * Сериализация черновиков ответов карточек для анти-читинга.
 * Хранится JSON-массив строк в колонке answers_json.
 */
public final class CardAnswers {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private CardAnswers() {
    }

    public static String write(List<String> answers) {
        try {
            return MAPPER.writeValueAsString(answers == null ? List.of() : answers);
        } catch (Exception e) {
            return "[]";
        }
    }

    public static List<String> read(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return MAPPER.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Есть ли хотя бы один непустой ответ — чтобы не создавать пустые попытки. */
    public static boolean hasAnyAnswer(List<String> answers) {
        if (answers == null) {
            return false;
        }
        return answers.stream().anyMatch(a -> a != null && !a.isBlank());
    }
}
