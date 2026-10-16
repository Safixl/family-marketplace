package com.familymarket.dto;

import com.familymarket.deposit.Deposit;

import java.math.BigDecimal;
import java.time.Instant;

public record DepositDto(
        Long id,
        Long childId,
        Long storeId,
        String storeName,
        String currencyName,
        String currencyIcon,
        BigDecimal amount,
        BigDecimal rate,
        Instant lastInterestAt) {

    public static DepositDto from(Deposit deposit) {
        return new DepositDto(
                deposit.getId(),
                deposit.getChild().getId(),
                deposit.getStore().getId(),
                deposit.getStore().getName(),
                deposit.getStore().getCurrencyName(),
                deposit.getStore().getCurrencyIcon(),
                deposit.getAmount(),
                deposit.getRate(),
                deposit.getLastInterestAt());
    }
}
