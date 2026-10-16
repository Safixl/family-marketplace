package com.familymarket.dto;

import java.time.LocalDate;

public record SeasonalEventUpsertRequest(
        String name,
        String description,
        String tokenName,
        String tokenIcon,
        LocalDate startsAt,
        LocalDate endsAt,
        Boolean active) {
}
