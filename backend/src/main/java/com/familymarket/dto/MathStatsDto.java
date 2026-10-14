package com.familymarket.dto;

import java.math.BigDecimal;
import java.util.List;

public record MathStatsDto(long solved, long total, long correct, BigDecimal pointsEarned,
                           List<MathAttemptDto> attempts) {
}