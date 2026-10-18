package com.familymarket.dto;

import java.math.BigDecimal;

/**
 * Стопка неиспользованных покупок в «Инвентаре» ребёнка (без статусов):
 * одинаковые товары сгруппированы по product_id, count — количество штук.
 */
public record InventoryStackDto(
        Long productId,
        String productName,
        Long storeId,
        String storeName,
        BigDecimal price,
        String currencyName,
        String currencyIcon,
        long count
) {
}