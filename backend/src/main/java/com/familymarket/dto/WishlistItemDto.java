package com.familymarket.dto;

import com.familymarket.wishlist.WishlistItem;

import java.math.BigDecimal;
import java.time.Instant;

public record WishlistItemDto(Long id, Long childId, String childName, String title,
                              String link, BigDecimal price, int desire,
                              String status, Instant createdAt) {

    public static WishlistItemDto from(WishlistItem item) {
        return new WishlistItemDto(
                item.getId(),
                item.getChild().getId(),
                item.getChild().getName(),
                item.getTitle(),
                item.getLink(),
                item.getPrice(),
                item.getDesire(),
                item.getStatus(),
                item.getCreatedAt());
    }
}
