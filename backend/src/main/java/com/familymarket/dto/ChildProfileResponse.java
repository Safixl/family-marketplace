package com.familymarket.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Профиль ребенка: балансы по магазинам, статистика оплаченных покупок
 * и разблокированные достижения.
 */
public record ChildProfileResponse(ChildBrief child, List<BalanceInfo> balances, Stats stats,
                                   List<AchievementInfo> achievements, List<PurchasedItemDto> purchasedItems) {

    public record ChildBrief(Long id, String name, String avatarEmoji) {
    }

    public record BalanceInfo(Long storeId, String storeName, String currencyName,
                              String currencyIcon, BigDecimal amount) {
    }

    public record Stats(long paidCount, BigDecimal paidTotal) {
    }

    public record AchievementInfo(Long id, String name, String description, String icon,
                                  Instant unlockedAt) {
    }
}