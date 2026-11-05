package com.familymarket.dto;

/**
 * Ответ на шаг 1 регистрации.
 * needsVerification=true — аккаунт создан, ждём код из письма (token/user = null);
 * needsVerification=false — почта не настроена, аккаунт подтверждён автоматически.
 */
public record RegisterResponse(String email, boolean needsVerification, String token, UserDto user) {
}
