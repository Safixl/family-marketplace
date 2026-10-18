package com.familymarket.dto;

import com.familymarket.limit.LimitEvent;

import java.time.Instant;

/** Событие тарификации лимита (для родителя). */
public record LimitEventDto(
        Long id,
        String limitType,
        String action,
        int seconds,
        Instant createdAt
) {
    public static LimitEventDto from(LimitEvent event) {
        return new LimitEventDto(event.getId(), event.getLimitType(), event.getAction(),
                event.getSeconds(), event.getCreatedAt());
    }
}