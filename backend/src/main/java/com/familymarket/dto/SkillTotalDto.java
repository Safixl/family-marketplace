package com.familymarket.dto;

/** Сколько ступеней достижений есть и получено по навыку (полоска прогресса). */
public record SkillTotalDto(String skill, long total, long unlocked) {
}