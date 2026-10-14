package com.familymarket.common;

import com.familymarket.security.AuthPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static AuthPrincipal get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthPrincipal principal) {
            return principal;
        }
        throw new BadRequestException("Не авторизован");
    }

    public static Long parentId() {
        AuthPrincipal principal = get();
        if (!"PARENT".equals(principal.type())) {
            throw new BadRequestException("Доступ только для родителя");
        }
        return principal.id();
    }

    public static Long childId() {
        AuthPrincipal principal = get();
        if (!"CHILD".equals(principal.type())) {
            throw new BadRequestException("Доступ только для ребенка");
        }
        return principal.id();
    }
}