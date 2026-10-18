package com.familymarket.dto;

import com.familymarket.limit.PocketRequest;

import java.math.BigDecimal;
import java.time.Instant;

public record PocketRequestDto(
        Long id,
        Long childId,
        String childName,
        String childAvatar,
        BigDecimal amount,
        String status,
        Instant createdAt,
        Instant resolvedAt
) {
    public static PocketRequestDto from(PocketRequest request) {
        return new PocketRequestDto(
                request.getId(),
                request.getChild().getId(),
                request.getChild().getName(),
                request.getChild().getAvatarEmoji(),
                request.getAmount(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getResolvedAt());
    }
}