package com.familymarket.dto;

import com.familymarket.seasonal.SeasonalEvent;

import java.time.Instant;
import java.time.LocalDate;

public record SeasonalEventDto(
        Long id,
        Long storeId,
        String name,
        String description,
        String tokenName,
        String tokenIcon,
        LocalDate startsAt,
        LocalDate endsAt,
        boolean active,
        boolean keepAfterEnd,
        boolean openNow,
        Instant createdAt) {

    public static SeasonalEventDto from(SeasonalEvent event, Long storeId) {
        return new SeasonalEventDto(
                event.getId(),
                storeId,
                event.getName(),
                event.getDescription(),
                event.getTokenName(),
                event.getTokenIcon(),
                event.getStartsAt(),
                event.getEndsAt(),
                event.isActive(),
                event.isKeepAfterEnd(),
                event.isOpenNow(),
                event.getCreatedAt());
    }
}
