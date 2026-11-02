package com.familymarket.dto;

import java.util.List;

/**
 * Состояние дейлика одного навыка.
 * pointsEarned/pointsTarget — баллы навыка, tasksDone/tasksTotal — число
 * выполненных заданий дня (карточки: до 3 в день; спорт/чтение/дом — 1 задание).
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
        long tasksDone,
        long tasksTotal,
        boolean fullClear,
        boolean completed) {
}
