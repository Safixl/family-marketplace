package com.familymarket.dto;

/**
 * Базовые лимиты ребёнка (для родителя): минуты в день + карманные деньги в неделю.
 */
public record ChildLimitsDto(
        Long childId,
        int tvMinutes,
        int pcMinutes,
        int consoleMinutes,
        int phoneMinutes,
        int tabletMinutes,
        int pocketWeekly
) {
}