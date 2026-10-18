package com.familymarket.dto;

import java.util.List;

/**
 * Карточка ребёнка в обзоре родителя: уровень, баллы, лимиты с остатками,
 * активные квесты, дейлики дня, прогресс навыков и активированные навыки.
 */
public record OverviewChildDto(
        Long id,
        String name,
        String avatarEmoji,
        Integer age,
        boolean active,
        LevelDto level,
        List<BalanceRowDto> balances,
        LimitStateDto limits,
        List<QuestDto> activeQuests,
        List<DailySkillDto> dailies,
        List<SkillProgressDto> skills,
        List<String> activatedSkills
) {
}