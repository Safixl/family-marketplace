package com.familymarket.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReadingStatsDto(long booksRead, long pagesRead, BigDecimal pointsEarned,
                              long pendingCount, BigDecimal pendingPoints,
                              List<ReadingLogDto> logs) {
}