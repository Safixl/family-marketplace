package com.familymarket.dto;

import com.familymarket.product.Product;

import java.math.BigDecimal;

public record ProductDto(Long id, Long storeId, String name, String description, BigDecimal price,
                         Integer limitPerChild, String limitPeriod, boolean active,
                         String effectType, String effectLimit, Integer effectValue) {

    public static ProductDto from(Product product) {
        return new ProductDto(
                product.getId(),
                product.getStore().getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getLimitPerChild(),
                product.getLimitPeriod(),
                product.isActive(),
                product.getEffectType(),
                product.getEffectLimit(),
                product.getEffectValue());
    }
}