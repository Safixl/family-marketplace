package com.familymarket.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BalanceAdjustRequest(
        @NotNull(message = "Укажите ребенка") Long childId,
        @NotNull(message = "Укажите магазин") Long storeId,
        @NotNull(message = "Укажите сумму изменения") BigDecimal delta) {
}