package com.familymarket.auth;

import com.familymarket.common.AuthRateLimiter;
import com.familymarket.common.TooManyRequestsException;
import com.familymarket.dto.AuthResponse;
import com.familymarket.dto.LoginRequest;
import com.familymarket.dto.RegisterRequest;
import com.familymarket.dto.RegisterResponse;
import jakarta.servlet.http.HttpServletRequest;
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
    private final AuthRateLimiter rateLimiter;

    public AuthController(AuthService authService, AuthRateLimiter rateLimiter) {
        this.authService = authService;
        this.rateLimiter = rateLimiter;
    }

    private void checkRate(HttpServletRequest request) {
        String key = AuthRateLimiter.clientKey(
                request.getHeader("X-Forwarded-For"), request.getRemoteAddr());
        if (!rateLimiter.allow("/api/auth" + request.getRequestURI() + "|" + key)) {
            throw new TooManyRequestsException("Слишком много попыток — подождите 15 минут");
        }
    }

    /** Шаг 1 регистрации: создать аккаунт и отправить код на почту. */
    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http) {
        checkRate(http);
        return authService.register(request);
    }

    /** Шаг 2 регистрации: подтвердить код из письма. */
    @PostMapping("/verify-email")
    public AuthResponse verifyEmail(@Valid @RequestBody AuthRequests.VerifyEmailRequest request, HttpServletRequest http) {
        checkRate(http);
        return authService.verifyEmail(request.email(), request.code());
    }

    /** Повторная отправка кода подтверждения. */
    @PostMapping("/resend-code")
    public Map<String, String> resendCode(@Valid @RequestBody AuthRequests.ForgotPasswordRequest request, HttpServletRequest http) {
        checkRate(http);
        authService.resendVerificationCode(request.email());
        return Map.of("message", "Код отправлен на почту");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        checkRate(http);
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
