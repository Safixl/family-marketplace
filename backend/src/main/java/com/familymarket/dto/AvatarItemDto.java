package com.familymarket.dto;

import com.familymarket.avatar.AvatarItem;

import java.time.Instant;

public record AvatarItemDto(
        Long id,
        String name,
        String description,
        String category,
        String icon,
        Instant createdAt) {

    public static AvatarItemDto from(AvatarItem item) {
        return new AvatarItemDto(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getCategory(),
                item.getIcon(),
                item.getCreatedAt());
    }
}
