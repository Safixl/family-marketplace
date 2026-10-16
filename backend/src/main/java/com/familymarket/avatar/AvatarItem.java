package com.familymarket.avatar;

import com.familymarket.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Предмет кастомизации аватара («Гардероб Героя»).
 * Категории: SKIN (скин) / FRAME (рамка профиля) / PET (питомец-спутник) / BACKGROUND (фон).
 */
@Entity
@Table(name = "avatar_items")
@Getter
@Setter
public class AvatarItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 32)
    private String category = "SKIN";

    @Column(nullable = false, length = 64)
    private String icon = "🎨";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
