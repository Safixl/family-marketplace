package com.familymarket.dto;

import com.familymarket.daily.DailyLog;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record DailyLogDto(
        Long id,
        Long childId,
        String skill,
        LocalDate day,
        String payload,
        BigDecimal points,
        int xp,
        boolean fullClear,
        Instant createdAt) {

    public static DailyLogDto from(DailyLog log) {
        return new DailyLogDto(
                log.getId(),
                log.getChild().getId(),
                log.getSkill(),
                log.getDay(),
                log.getPayload(),
                log.getPoints(),
                log.getXp(),
                log.isFullClear(),
                log.getCreatedAt());
    }
}
