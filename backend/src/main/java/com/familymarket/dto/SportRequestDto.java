package com.familymarket.dto;

import com.familymarket.sport.SportRequest;

import java.time.Instant;

/** Запрос ребёнка на новое направление (для ленты родителя и истории ребёнка). */
public record SportRequestDto(
        Long requestId,
        Long childId,
        String childName,
        String childAvatar,
        String name,
        String comment,
        String status,
        Instant createdAt) {

    public static SportRequestDto of(SportRequest r) {
        return new SportRequestDto(
                r.getId(),
                r.getChild().getId(),
                r.getChild().getName(),
                r.getChild().getAvatarEmoji(),
                r.getName(),
                r.getComment(),
                r.getStatus(),
                r.getCreatedAt());
    }
}
