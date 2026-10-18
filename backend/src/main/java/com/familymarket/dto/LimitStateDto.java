package com.familymarket.dto;

import java.util.List;

/**
 * Полное состояние лимитов ребёнка: полоски времени + карманные деньги.
 */
public record LimitStateDto(
        List<LimitTypeState> limits,
        PocketState pocket
) {
}