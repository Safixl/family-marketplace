package com.familymarket.dto;

import com.familymarket.child.Child;

import java.time.Instant;

public record ChildDto(Long id, String name, String avatarEmoji, String accessKey, boolean active,
                       Integer age, Instant createdAt) {

    public static ChildDto from(Child child) {
        return new ChildDto(
                child.getId(),
                child.getName(),
                child.getAvatarEmoji(),
                child.getAccessKey(),
                child.isActive(),
                child.getAge(),
                child.getCreatedAt());
    }
}