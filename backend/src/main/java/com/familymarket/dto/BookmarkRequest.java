package com.familymarket.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record BookmarkRequest(
        @NotNull(message = "Укажите страницу") @Min(value = 1, message = "Страница должна быть больше нуля") Integer page
) {
}