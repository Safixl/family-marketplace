package com.familymarket.dto;

import com.familymarket.reading.ReadingRequest;

import java.time.Instant;

public record ReadingRequestDto(Long id, Long childId, String childName, Long storeId,
                                String title, String status, Instant createdAt, Instant resolvedAt) {

    public static ReadingRequestDto from(ReadingRequest request) {
        return new ReadingRequestDto(
                request.getId(),
                request.getChild().getId(),
                request.getChild().getName(),
                request.getStore().getId(),
                request.getTitle(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getResolvedAt());
    }
}