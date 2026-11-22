package com.familymarket.dto;

import jakarta.validation.constraints.NotNull;

/** Переключение «Лимита доверия» ребёнка. */
public record TrustLimitRequest(@NotNull Boolean enabled) {
}
