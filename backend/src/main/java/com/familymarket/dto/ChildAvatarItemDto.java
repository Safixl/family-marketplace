package com.familymarket.dto;

import com.familymarket.avatar.ChildAvatarItem;

import java.time.Instant;

public record ChildAvatarItemDto(
        Long id,
        Long itemId,
        String name,
        String category,
        String icon,
        boolean equipped,
        Instant unlockedAt) {

    public static ChildAvatarItemDto from(ChildAvatarItem item) {
        return new ChildAvatarItemDto(
                item.getId(),
                item.getItem().getId(),
                item.getItem().getName(),
                item.getItem().getCategory(),
                item.getItem().getIcon(),
                item.isEquipped(),
                item.getUnlockedAt());
    }
}
