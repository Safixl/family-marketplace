package com.familymarket.dto;

import com.familymarket.store.Store;

import java.time.Instant;

public record StoreDto(Long id, String name, String description, String currencyName, String currencyIcon,
                       boolean active, String templateType, boolean wardrobe, Instant createdAt) {

    public static StoreDto from(Store store) {
        return new StoreDto(
                store.getId(),
                store.getName(),
                store.getDescription(),
                store.getCurrencyName(),
                store.getCurrencyIcon(),
                store.isActive(),
                store.getTemplateType(),
                store.isWardrobe(),
                store.getCreatedAt());
    }
}