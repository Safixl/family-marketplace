package com.familymarket.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Укажите имя") @Size(max = 100, message = "Имя слишком длинное") String name,
        @NotBlank(message = "Укажите email") @Email(message = "Некорректный email") String email,
        @NotBlank(message = "Укажите пароль") @Size(min = 6, max = 100, message = "Пароль должен быть от 6 символов") String password) {
}