package com.familymarket.dto;

import com.familymarket.achievement.Achievement;

import java.math.BigDecimal;
import java.time.Instant;

public record AchievementDto(Long id, String name, String description, String icon,
                             BigDecimal rewardAmount, String targetType, int targetValue,
                             String groupKey, String skill, int level, boolean hiddenReward, Long rewardStoreId,
                             int xpReward, String title,
                             Instant createdAt) {

    public static AchievementDto from(Achievement achievement) {
        return new AchievementDto(
                achievement.getId(),
                achievement.getName(),
                achievement.getDescription(),
                achievement.getIcon(),
                achievement.getRewardAmount(),
                achievement.getTargetType(),
                achievement.getTargetValue(),
                achievement.getGroupKey(),
                achievement.getSkill(),
                achievement.getLevel(),
                achievement.isHiddenReward(),
                achievement.getRewardStore() == null ? null : achievement.getRewardStore().getId(),
                achievement.getXpReward(),
                achievement.getTitle(),
                achievement.getCreatedAt());
    }
}
