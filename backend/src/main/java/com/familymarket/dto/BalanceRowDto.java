package com.familymarket.dto;

import java.math.BigDecimal;

public record BalanceRowDto(Long childId, String childName, String childAvatar,
                            Long storeId, String storeName, String currencyName, String currencyIcon,
                            BigDecimal amount) {
}