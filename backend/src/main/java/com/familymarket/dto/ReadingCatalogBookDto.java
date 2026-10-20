package com.familymarket.dto;

import com.familymarket.reading.ReadingBookCatalog;

public record ReadingCatalogBookDto(
        String id,
        String name,
        String author,
        String series,
        String genre,
        int pages,
        String quest,
        /** Прочитана ли книга ребёнком (одобренный лог с таким названием). */
        boolean read
) {
    public static ReadingCatalogBookDto from(ReadingBookCatalog.CatalogBook book, boolean read) {
        return new ReadingCatalogBookDto(book.id(), book.name(), book.author(), book.series(),
                book.genre(), book.pages(), book.quest(), read);
    }
}