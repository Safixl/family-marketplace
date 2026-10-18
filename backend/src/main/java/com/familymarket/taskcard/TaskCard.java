package com.familymarket.taskcard;

import com.familymarket.child.Child;
import com.familymarket.store.Store;
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

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Карточка с заданиями (математика / помощь по дому).
 * Родитель создаёт карточку: сложность, список заданий (JSON), время, награда,
 * редкость скрытой награды и порог % успешных ответов.
 */
@Entity
@Table(name = "task_cards")
@Getter
@Setter
public class TaskCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id")
    private Child child;

    /** MATH / HOUSE */
    @Column(nullable = false, length = 20)
    private String skill = "MATH";

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 64)
    private String icon = "🎴";

    /** EASY / MEDIUM / HARD */
    @Column(nullable = false, length = 20)
    private String difficulty = "EASY";

    /** JSON: [{"q":"...","a":"..."}] */
    @Column(name = "tasks_json", nullable = false, length = 8000)
    private String tasksJson;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "reward_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal rewardAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_store_id")
    private Store rewardStore;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    /** Для HOUSE: +n к living_score в календаре. */
    @Column(name = "house_bonus", nullable = false)
    private int houseBonus;

    /** COMMON / RARE / UNCOMMON / EPIC / LEGENDARY */
    @Column(nullable = false, length = 20)
    private String rarity = "COMMON";

    @Column(name = "hidden_reward", nullable = false)
    private boolean hiddenReward;

    /** Порог успешных ответов для награды (%). */
    @Column(name = "success_percent", nullable = false)
    private int successPercent = 80;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}