package com.familymarket.dto;

import jakarta.validation.constraints.NotNull;

public record CreatePurchaseRequest(@NotNull(message = "Укажите товар") Long productId) {
}