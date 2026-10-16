package com.familymarket.child;

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

@Entity
@Table(name = "children")
@Getter
@Setter
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "avatar_emoji", nullable = false, length = 16)
    private String avatarEmoji;

    @Column(name = "access_key", nullable = false, unique = true, length = 64)
    private String accessKey;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Тема оформления детского интерфейса (rainbow, space, ocean, forest, sunset, minimal). */
    @Column(length = 32)
    private String theme = "rainbow";

    /** JSON-массив виджетов главной страницы ребёнка. */
    @Column(name = "home_widgets", length = 500)
    private String homeWidgets = "[\"balances\",\"stats\",\"achievements\",\"orders\"]";

    /** Возраст ребёнка (5-16): влияет на сложность дейликов и масштаб цен. */
    @Column
    private Integer age;
}