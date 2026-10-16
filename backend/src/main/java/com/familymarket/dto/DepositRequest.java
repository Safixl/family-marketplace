package com.familymarket.dto;

import java.math.BigDecimal;

public record DepositRequest(Long storeId, BigDecimal amount, BigDecimal rate) {
}
