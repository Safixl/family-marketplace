package com.familymarket.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Купленный товар (отображается в профиле ребёнка, в т.ч. одноразовые покупки магазина «Дом»).
 */
public record PurchasedItemDto(Long productId, String productName, BigDecimal price,
                               Long storeId, String storeName, String currencyName, String currencyIcon,
                               Instant confirmedAt) {
}