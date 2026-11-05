package com.familymarket.auth;

import com.familymarket.common.BadRequestException;
import com.familymarket.common.ConflictException;
import com.familymarket.dto.AuthResponse;
import com.familymarket.dto.LoginRequest;
import com.familymarket.dto.RegisterRequest;
import com.familymarket.dto.RegisterResponse;
import com.familymarket.dto.UserDto;
import com.familymarket.security.JwtService;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Регистрация с подтверждением e-mail кодом из письма, вход и сброс пароля.
 * Если почта не настроена (app.mail.enabled=false) — режим разработки:
 * регистрация подтверждается автоматически, токены сброса пишутся в лог.
 */
@Service
public class AuthService {

    private static final long VERIFY_TTL_MINUTES = 15;
    private static final long RESET_TTL_MINUTES = 60;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    /** Шаг 1 регистрации: создать аккаунт (неподтверждённый) и отправить код на почту. */
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("Пользователь с таким email уже зарегистрирован");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name().trim());
        user.setEmailVerified(false);
        user.setCreatedAt(Instant.now());
        userRepository.save(user);

        if (mailService.isEnabled()) {
            issueVerificationCode(user);
            return new RegisterResponse(email, true, null, null);
        }
        // Режим разработки без SMTP: подтверждаем автоматически
        user.setEmailVerified(true);
        userRepository.save(user);
        AuthResponse res = toResponse(user);
        return new RegisterResponse(email, false, res.token(), res.user());
    }

    /** Шаг 2 регистрации: подтвердить код из письма. */
    @Transactional
    public AuthResponse verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new BadRequestException("Аккаунт не найден"));
        if (user.isEmailVerified()) {
            return toResponse(user);
        }
        if (user.getVerificationCode() == null
                || user.getVerificationExpires() == null
                || user.getVerificationExpires().isBefore(Instant.now())
                || !user.getVerificationCode().equals(code == null ? "" : code.trim())) {
            throw new BadRequestException("Неверный или устаревший код — запросите новый");
        }
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationExpires(null);
        userRepository.save(user);
        return toResponse(user);
    }

    /** Повторная отправка кода подтверждения. */
    @Transactional
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new BadRequestException("Аккаунт не найден"));
        if (user.isEmailVerified()) {
            return;
        }
        issueVerificationCode(user);
    }

    /** Вход: только для подтверждённых аккаунтов. */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Неверный email или пароль"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Неверный email или пароль");
        }
        if (!user.isEmailVerified()) {
            issueVerificationCode(user);
            userRepository.save(user);
            throw new BadRequestException(
                    "Email не подтверждён — мы отправили новый код на почту. Введите его, чтобы завершить регистрацию");
        }
        return toResponse(user);
    }

    /** Запрос сброса пароля: ссылка уходит на почту (ответ всегда одинаковый — без раскрытия existence). */
    @Transactional
    public String forgotPassword(String email) {
        userRepository.findByEmail(normalize(email)).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            user.setResetToken(token);
            user.setResetExpires(Instant.now().plus(RESET_TTL_MINUTES, ChronoUnit.MINUTES));
            userRepository.save(user);
            if (mailService.isEnabled()) {
                mailService.sendPasswordReset(user.getEmail(), token);
            } else {
                // Режим разработки: ссылка только в логе
                org.slf4j.LoggerFactory.getLogger(AuthService.class)
                        .info("MAIL DISABLED — ссылка сброса пароля для {}: {}/reset-password?token={}",
                                user.getEmail(), mailService.frontendUrl(), token);
            }
        });
        return "Если аккаунт существует — письмо со ссылкой для сброса отправлено";
    }

    /** Сброс пароля по токену из письма. */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token == null ? "" : token.trim())
                .orElseThrow(() -> new BadRequestException("Ссылка недействительна или устарела"));
        if (user.getResetToken() == null
                || user.getResetExpires() == null
                || user.getResetExpires().isBefore(Instant.now())
                || !user.getResetToken().equals(token == null ? "" : token.trim())) {
            throw new BadRequestException("Ссылка недействительна или устарела");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetExpires(null);
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    // ---------- Внутреннее ----------

    private void issueVerificationCode(User user) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        user.setVerificationCode(code);
        user.setVerificationExpires(Instant.now().plus(VERIFY_TTL_MINUTES, ChronoUnit.MINUTES));
        userRepository.save(user);
        mailService.sendVerificationCode(user.getEmail(), code);
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private AuthResponse toResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new UserDto(user.getId(), user.getEmail(), user.getName()));
    }
}
