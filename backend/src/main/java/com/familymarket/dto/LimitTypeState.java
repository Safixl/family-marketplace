package com.familymarket.dto;

/**
 * Состояние одного лимита времени для ребёнка (в секундах).
 * remainingSeconds может превышать baseMinutes*60 за счёт одноразовых увеличений.
 * frozen — лимит заморожен родителем (счётчик запустить нельзя).
 */
public record LimitTypeState(
        String type,
        int baseMinutes,
        int usedSeconds,
        int extendedSeconds,
        int remainingSeconds,
        boolean running,
        boolean frozen
) {
}