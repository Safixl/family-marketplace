package com.familymarket.dto;

/**
 * Состояние одного лимита времени (в секундах).
 * remainingSeconds может превышать baseMinutes*60 за счёт одноразовых увеличений.
 * frozen — лимит заморожен родителем (счётчик запустить нельзя).
 * enabled — лимит включён родителем (выключенные видны только родителю).
 * label — название кастомного лимита (для стандартных — null).
 */
public record LimitTypeState(
        String type,
        int baseMinutes,
        int usedSeconds,
        int extendedSeconds,
        int remainingSeconds,
        boolean running,
        boolean frozen,
        boolean enabled,
        String label
) {
}
