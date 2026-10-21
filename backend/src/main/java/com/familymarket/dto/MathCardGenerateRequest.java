package com.familymarket.dto;

/** Выбор ребёнка: EASY / MEDIUM / HIGH / HARD / EXTREME / OLYMPIAD (лейблы «Легкая…Олимпиада»). */
public record MathCardGenerateRequest(String choice) {
}