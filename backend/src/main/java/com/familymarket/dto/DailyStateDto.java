package com.familymarket.dto;

import java.util.List;

/**
 * Ежедневные дейлики ребёнка: состояние по навыкам на текущий день.
 */
public record DailyStateDto(String day, List<DailySkillDto> skills) {
}
