package com.familymarket.dto;

import com.familymarket.seasonal.SeasonalEvent;

import java.time.Instant;
import java.time.LocalDate;

public record SeasonalEventDto(
        Long id,
        String name,
        String description,
        String tokenName,
        String tokenIcon,
        LocalDate startsAt,
        LocalDate endsAt,
        boolean active,
        boolean openNow,
        Instant createdAt) {

    public static SeasonalEventDto from(SeasonalEvent event) {
        return new SeasonalEventDto(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getTokenName(),
                event.getTokenIcon(),
                event.getStartsAt(),
                event.getEndsAt(),
                event.isActive(),
                event.isOpenNow(),
                event.getCreatedAt());
    }
}
