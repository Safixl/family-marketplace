package com.familymarket.dto;

import com.familymarket.purchase.Purchase;
import com.familymarket.purchase.PurchaseStatus;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Покупка в представлении родителя.
 */
public record PurchaseDto(Long id, Long childId, String childName, String childAvatar,
                          Long storeId, String storeName, Long productId, String productName,
                          BigDecimal amount, PurchaseStatus status, Instant createdAt, Instant confirmedAt,
                          String currencyName, String currencyIcon) {

    public static PurchaseDto from(Purchase purchase) {
        return new PurchaseDto(
                purchase.getId(),
                purchase.getChild().getId(),
                purchase.getChild().getName(),
                purchase.getChild().getAvatarEmoji(),
                purchase.getStore().getId(),
                purchase.getStore().getName(),
                purchase.getProduct().getId(),
                purchase.getProduct().getName(),
                purchase.getAmount(),
                purchase.getStatus(),
                purchase.getCreatedAt(),
                purchase.getConfirmedAt(),
                purchase.getStore().getCurrencyName(),
                purchase.getStore().getCurrencyIcon());
    }
}