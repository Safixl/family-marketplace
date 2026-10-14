package com.familymarket.security;

import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Фильтр для ребёнка: читает заголовок {@code X-Access-Key}, ищет активного ребёнка
 * и кладёт его в SecurityContext (ROLE_CHILD). «Сессия» жёстко привязана к ключу:
 * если ключ перегенерирован или ребёнок деактивирован, доступ прекращается.
 */
@Component
public class AccessKeyAuthFilter extends OncePerRequestFilter {

    private final ChildRepository childRepository;

    public AccessKeyAuthFilter(ChildRepository childRepository) {
        this.childRepository = childRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String accessKey = request.getHeader("X-Access-Key");
            if (accessKey != null && !accessKey.isBlank()) {
                Optional<Child> child =
                        childRepository.findByAccessKeyAndActiveTrue(accessKey.trim().toUpperCase());
                if (child.isPresent()) {
                    AuthPrincipal principal = new AuthPrincipal(child.get().getId(), "CHILD");
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    principal, null, List.of(new SimpleGrantedAuthority("ROLE_CHILD")));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}