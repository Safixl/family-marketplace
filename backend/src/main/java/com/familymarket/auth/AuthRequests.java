package com.familymarket.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO аутентификации: подтверждение email и сброс пароля. */
public final class AuthRequests {

    private AuthRequests() {
    }

    public record VerifyEmailRequest(
            @NotBlank(message = "Укажите email") String email,
            @NotBlank(message = "Укажите код из письма") @Size(max = 10) String code) {
    }

    public record ForgotPasswordRequest(
            @NotBlank(message = "Укажите email") String email) {
    }

    public record ResetPasswordRequest(
            @NotBlank(message = "Ссылка недействительна") String token,
            @NotBlank(message = "Укажите новый пароль") @Size(min = 6, max = 100, message = "Пароль должен быть от 6 символов") String password) {
    }
}
