package com.familymarket.dto;

import com.familymarket.house.HouseCheckRequest;

import java.time.Instant;
import java.time.LocalDate;

public record HouseCheckRequestDto(
        Long id,
        Long childId,
        String childName,
        String childAvatar,
        Long storeId,
        LocalDate day,
        String status,
        Instant createdAt,
        Instant resolvedAt
) {
    public static HouseCheckRequestDto from(HouseCheckRequest request) {
        return new HouseCheckRequestDto(
                request.getId(),
                request.getChild().getId(),
                request.getChild().getName(),
                request.getChild().getAvatarEmoji(),
                request.getStore().getId(),
                request.getDay(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getResolvedAt());
    }
}