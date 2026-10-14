package com.familymarket.security;

import java.security.Principal;

/**
 * Принципал аутентификации. {@code type} — "PARENT" или "CHILD".
 */
public record AuthPrincipal(Long id, String type) implements Principal {

    @Override
    public String getName() {
        return String.valueOf(id);
    }
}