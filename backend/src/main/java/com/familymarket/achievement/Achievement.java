package com.familymarket.achievement;

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

@Entity
@Table(name = "achievements")
@Getter
@Setter
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 64)
    private String icon;

    @Column(name = "reward_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal rewardAmount = BigDecimal.ZERO;

    @Column(name = "target_type", nullable = false, length = 32)
    private String targetType = "NONE";

    @Column(name = "target_value", nullable = false)
    private int targetValue;

    @Column(name = "group_key", length = 64)
    private String groupKey;

    /** Направление развития (навык): MATH / READING / LOGIC / LANG / SPORT / HOUSE / NULL */
    @Column(length = 32)
    private String skill;

    @Column(nullable = false)
    private int level;

    @Column(name = "hidden_reward", nullable = false)
    private boolean hiddenReward;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_store_id")
    private Store rewardStore;

    /** Общий опыт, начисляемый за достижение. */
    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    /** Титул персонажа за достижение (например, «Хранитель Порядка»). */
    @Column(length = 100)
    private String title;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}