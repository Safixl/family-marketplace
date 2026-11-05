package com.familymarket.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Отправка писем (код подтверждения, сброс пароля).
 * Если почта не настроена (app.mail.enabled=false) — письма не отправляются:
 * регистрация подтверждается автоматически, токены сброса пишутся в лог.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;
    private final String frontendUrl;

    public MailService(JavaMailSender mailSender,
                       @Value("${app.mail.enabled:false}") boolean enabled,
                       @Value("${spring.mail.username:}") String from,
                       @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
        this.frontendUrl = frontendUrl;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String frontendUrl() {
        return frontendUrl;
    }

    /** Код подтверждения регистрации (6 цифр). */
    public void sendVerificationCode(String to, String code) {
        String body = """
                <div style="font-family:Georgia,serif;background:#14100c;color:#f5efe6;padding:32px;border:2px solid #b45309;border-radius:12px">
                  <h2 style="color:#fbbf24;margin:0 0 16px">Family Marketplace</h2>
                  <p>Код подтверждения регистрации:</p>
                  <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#fbbf24">%s</p>
                  <p style="color:#a89a86">Код действует 15 минут. Если вы не регистрировались — просто игнорируйте письмо.</p>
                </div>
                """.formatted(code);
        send(to, "Код подтверждения: " + code, body);
    }

    /** Ссылка для сброса пароля. */
    public void sendPasswordReset(String to, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String body = """
                <div style="font-family:Georgia,serif;background:#14100c;color:#f5efe6;padding:32px;border:2px solid #b45309;border-radius:12px">
                  <h2 style="color:#fbbf24;margin:0 0 16px">Family Marketplace</h2>
                  <p>Вы запросили сброс пароля. Ссылка действует 1 час:</p>
                  <p><a href="%s" style="color:#fbbf24">%s</a></p>
                  <p style="color:#a89a86">Если вы не запрашивали сброс — просто игнорируйте письмо, пароль не изменится.</p>
                </div>
                """.formatted(link, link);
        send(to, "Сброс пароля", body);
    }

    private void send(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Письмо отправлено: {} -> {}", subject, to);
        } catch (Exception e) {
            log.error("Не удалось отправить письмо на {}: {}", to, e.getMessage());
            throw new RuntimeException("Не удалось отправить письмо — проверьте настройки почты", e);
        }
    }
}
