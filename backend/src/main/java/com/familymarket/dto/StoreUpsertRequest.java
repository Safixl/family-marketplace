package com.familymarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StoreUpsertRequest(
        @NotBlank(message = "Укажите название магазина") @Size(max = 150, message = "Название слишком длинное") String name,
        @Size(max = 2000, message = "Описание слишком длинное") String description,
        @NotBlank(message = "Укажите название валюты") @Size(max = 50, message = "Название валюты слишком длинное") String currencyName,
        @Size(max = 16, message = "Иконка валюты слишком длинная") String currencyIcon,
        Boolean active,
        Boolean wardrobe) {
}