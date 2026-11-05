package com.familymarket.auth;

import com.familymarket.dto.AuthResponse;
import com.familymarket.dto.LoginRequest;
import com.familymarket.dto.RegisterRequest;
import com.familymarket.dto.RegisterResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Шаг 1 регистрации: создать аккаунт и отправить код на почту. */
    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /** Шаг 2 регистрации: подтвердить код из письма. */
    @PostMapping("/verify-email")
    public AuthResponse verifyEmail(@Valid @RequestBody AuthRequests.VerifyEmailRequest request) {
        return authService.verifyEmail(request.email(), request.code());
    }

    /** Повторная отправка кода подтверждения. */
    @PostMapping("/resend-code")
    public Map<String, String> resendCode(@Valid @RequestBody AuthRequests.ForgotPasswordRequest request) {
        authService.resendVerificationCode(request.email());
        return Map.of("message", "Код отправлен на почту");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Запрос ссылки сброса пароля (письмо на почту). */
    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody AuthRequests.ForgotPasswordRequest request) {
        return Map.of("message", authService.forgotPassword(request.email()));
    }

    /** Сброс пароля по токену из письма. */
    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody AuthRequests.ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.password());
        return Map.of("message", "Пароль изменён — войдите с новым паролем");
    }
}
