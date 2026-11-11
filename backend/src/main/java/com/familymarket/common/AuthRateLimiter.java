package com.familymarket.common;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Простой in-memory rate limiter для чувствительных эндпоинтов
 * (логин/регистрация/сессия ребёнка). Защита от перебора кодов и паролей.
 *
 * Правило: не более {@link #MAX_REQUESTS} запросов с одного ключа (IP)
 * за окно {@link #WINDOW}.
 */
@Component
public class AuthRateLimiter {

    private static final int MAX_REQUESTS = 10;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    /** Разрешён ли запрос с данного ключа (IP). true — разрешён. */
    public boolean allow(String key) {
        if (key == null || key.isBlank()) {
            return true;
        }
        Instant now = Instant.now();
        Deque<Instant> queue = attempts.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (queue) {
            // выкидываем устаревшие попытки
            while (!queue.isEmpty() && queue.peekFirst().isBefore(now.minus(WINDOW))) {
                queue.pollFirst();
            }
            if (queue.size() >= MAX_REQUESTS) {
                return false;
            }
            queue.addLast(now);
            return true;
        }
    }

    /** Ключ по IP из заголовков прокси или удалённого адреса. */
    public static String clientKey(String xForwardedFor, String remoteAddr) {
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return remoteAddr == null ? "unknown" : remoteAddr;
    }
}
