package com.familymarket.dto;

import com.familymarket.reading.ReadingBook;

import java.math.BigDecimal;
import java.time.Instant;

public record ReadingBookDto(Long id, Long storeId, Long childId, String name, String author, String series,
                             String genre, int pages, BigDecimal multiplier, boolean active,
                             Instant createdAt, Integer currentPage) {

    public static ReadingBookDto from(ReadingBook book) {
        return new ReadingBookDto(
                book.getId(),
                book.getStore().getId(),
                book.getChild() == null ? null : book.getChild().getId(),
                book.getName(),
                book.getAuthor(),
                book.getSeries(),
                book.getGenre(),
                book.getPages(),
                book.getMultiplier(),
                book.isActive(),
                book.getCreatedAt(),
                null);
    }

    /** То же, но с текущей страницей ребёнка (для архива чтения). */
    public static ReadingBookDto withCurrentPage(ReadingBook book, Integer currentPage) {
        return new ReadingBookDto(
                book.getId(),
                book.getStore().getId(),
                book.getChild() == null ? null : book.getChild().getId(),
                book.getName(),
                book.getAuthor(),
                book.getSeries(),
                book.getGenre(),
                book.getPages(),
                book.getMultiplier(),
                book.isActive(),
                book.getCreatedAt(),
                currentPage);
    }
}