package com.familymarket.dto;

import com.familymarket.notification.Notification;

import java.time.Instant;

public record NotificationDto(
        Long id,
        Long childId,
        String childName,
        String childAvatar,
        String type,
        String title,
        String payload,
        String refType,
        Long refId,
        String status,
        Instant createdAt
) {
    public static NotificationDto from(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getChild() == null ? null : notification.getChild().getId(),
                notification.getChild() == null ? null : notification.getChild().getName(),
                notification.getChild() == null ? null : notification.getChild().getAvatarEmoji(),
                notification.getType(),
                notification.getTitle(),
                notification.getPayload(),
                notification.getRefType(),
                notification.getRefId(),
                notification.getStatus(),
                notification.getCreatedAt());
    }
}