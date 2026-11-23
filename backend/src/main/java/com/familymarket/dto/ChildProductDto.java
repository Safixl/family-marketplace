package com.familymarket.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Товар на витрине ребенка: добавляются данные магазина/валюты,
 * прогресс лимита, период его сброса и флаг ожидающего заказа.
 */
public record ChildProductDto(Long id, Long storeId, String storeName, String name, String description,
                              BigDecimal price, Integer limitPerChild, String limitPeriod,
                              Instant limitResetAt, String currencyName,
                              String currencyIcon, long boughtCount, boolean hasPending) {
}