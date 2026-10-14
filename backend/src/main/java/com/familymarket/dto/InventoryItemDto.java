package com.familymarket.dto;

import com.familymarket.inventory.InventoryItem;

import java.math.BigDecimal;
import java.time.Instant;

public record InventoryItemDto(
        Long id,
        Long childId,
        String childName,
        String childAvatar,
        Long storeId,
        String storeName,
        Long productId,
        String productName,
        BigDecimal price,
        String currencyName,
        String currencyIcon,
        String status,
        Instant createdAt,
        Instant resolvedAt) {

    public static InventoryItemDto from(InventoryItem item) {
        return new InventoryItemDto(
                item.getId(),
                item.getChild().getId(),
                item.getChild().getName(),
                item.getChild().getAvatarEmoji(),
                item.getStore().getId(),
                item.getStore().getName(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getPurchase().getAmount(),
                item.getStore().getCurrencyName(),
                item.getStore().getCurrencyIcon(),
                item.getStatus(),
                item.getCreatedAt(),
                item.getResolvedAt());
    }
}
