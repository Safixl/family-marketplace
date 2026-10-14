package com.familymarket.dto;

public record StoreTemplateDto(String slug, String name, String description,
                               String currencyName, String currencyIcon, String type) {
}