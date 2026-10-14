package com.familymarket.dto;

import com.familymarket.math.MathTask;

import java.math.BigDecimal;
import java.time.Instant;

public record MathTaskDto(Long id, Long storeId, Long childId, String title, String description,
                          BigDecimal points, boolean active, Instant createdAt) {

    public static MathTaskDto from(MathTask task) {
        return new MathTaskDto(
                task.getId(),
                task.getStore().getId(),
                task.getChild() == null ? null : task.getChild().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPoints(),
                task.isActive(),
                task.getCreatedAt());
    }
}