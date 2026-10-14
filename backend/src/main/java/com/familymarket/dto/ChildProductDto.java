package com.familymarket.dto;

import java.math.BigDecimal;

/**
 * Товар на витрине ребенка: добавляются данные магазина/валюты,
 * прогресс лимита и флаг ожидающего заказа.
 */
public record ChildProductDto(Long id, Long storeId, String storeName, String name, String description,
                              BigDecimal price, Integer limitPerChild, String currencyName,
                              String currencyIcon, long boughtCount, boolean hasPending) {
}