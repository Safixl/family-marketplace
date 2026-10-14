package com.familymarket.dto;

import com.familymarket.reading.ReadingLog;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReadingLogDto(Long id, Long childId, Long bookId, String bookName, String author,
                            int pages, BigDecimal multiplier, BigDecimal points, String status,
                            LocalDate readAt) {

    public static ReadingLogDto from(ReadingLog log) {
        return new ReadingLogDto(
                log.getId(),
                log.getChild().getId(),
                log.getBook().getId(),
                log.getBook().getName(),
                log.getBook().getAuthor(),
                log.getBook().getPages(),
                log.getBook().getMultiplier(),
                log.getPoints(),
                log.getStatus(),
                log.getReadAt());
    }
}