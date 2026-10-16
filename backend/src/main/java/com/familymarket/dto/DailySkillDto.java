package com.familymarket.dto;

import java.util.List;

/**
 * Состояние дейлика одного навыка на сегодня.
 * tasks — для LOGIC/MATH; words — для LANG; minutes/steps — для SPORT.
 */
public record DailySkillDto(
        String skill,
        String name,
        String icon,
        String currencyName,
        String currencyIcon,
        List<DailyTaskDto> tasks,
        List<LangWordDto> words,
        long minutesLogged,
        long stepsLogged,
        long pointsEarned,
        long pointsTarget,
        boolean fullClear,
        boolean completed) {
}
