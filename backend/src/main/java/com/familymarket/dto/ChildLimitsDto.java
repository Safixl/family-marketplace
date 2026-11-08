package com.familymarket.dto;

import java.util.List;

public record ChildLimitsDto(
        Long childId,
        int tvMinutes,
        int pcMinutes,
        int consoleMinutes,
        int phoneMinutes,
        int tabletMinutes,
        int pocketWeekly,
        /** Выключенные родителем стандартные типы лимитов. */
        List<String> disabledTypes,
        /** Кастомные лимиты (до 3). */
        List<CustomLimitDto> customLimits
) {
}
