package com.familymarket.dto;

import jakarta.validation.constraints.NotNull;

public record FreezeRequest(
        @NotNull(message = "Укажите состояние") Boolean frozen
) {
}