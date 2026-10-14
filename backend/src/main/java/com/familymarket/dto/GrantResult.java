package com.familymarket.dto;

import java.math.BigDecimal;

public record GrantResult(Long achievementId, Long childId, BigDecimal rewardCredited, Long storeId) {
}