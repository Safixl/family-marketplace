package com.familymarket.dto;

import java.util.List;

/**
 * Состояние дейлика одного навыка.
 * pointsEarned/pointsTarget — баллы навыка.
 * tasksDone/tasksTotal — число заданий дня (карточки: до 3; спорт/чтение/дом: 1).
 * tasksOk/tasksFail — из них зачтено положительно / отрицательно:
 *   все «+» → зелёная галочка, все «−» → красный крестик, смесь → жёлтый квадратик,
 *   выполнено не всё → синий восклицательный знак.
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
        long tasksOk,
        long tasksFail,
        boolean fullClear,
        boolean completed) {
}
