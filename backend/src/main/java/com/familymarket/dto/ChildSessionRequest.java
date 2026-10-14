package com.familymarket.dto;

import jakarta.validation.constraints.NotBlank;

public record ChildSessionRequest(@NotBlank(message = "Введите ключ доступа") String accessKey) {
}