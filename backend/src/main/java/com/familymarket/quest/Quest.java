package com.familymarket.quest;

import com.familymarket.child.Child;
import com.familymarket.seasonal.SeasonalEvent;
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
 * Квест от ГМа (родителя). Типы:
 * DAILY — повторяемый дейлик; STORY — сюжетный разовый; SEASONAL — сезонный (награда жетонами).
 * Награда: валюта магазина (reward_amount) + общий опыт (xp_reward).
 */
@Entity
@Table(name = "quests")
@Getter
@Setter
public class Quest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    /** Если null — квест доступен всем детям родителя. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id")
    private Child child;

    @Column(nullable = false, length = 20)
    private String type = "STORY";

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 2000)
    private String description;

    /** Описание на этапе (!) — доступен для принятия (базовое описание). */
    @Column(name = "basic_description", length = 2000)
    private String basicDescription;

    /** Описание на этапе (?) — после принятия (критерии сдачи). */
    @Column(name = "accept_description", length = 2000)
    private String acceptDescription;

    /** Таймер на выполнение (минуты), опционально. */
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    /** Перерыв между выполнениями повторяемого квеста (часы). */
    @Column(name = "cooldown_hours", nullable = false)
    private int cooldownHours;

    @Column(nullable = false, length = 64)
    private String icon = "📜";

    /** Магазин, в валюту которого начисляется награда. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_store_id")
    private Store rewardStore;

    @Column(name = "reward_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal rewardAmount = BigDecimal.ZERO;

    /** Общий опыт за выполнение квеста. */
    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    /** Сезонный ивент: квест выдаёт сезонные жетоны (store баланс ивента). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seasonal_event_id")
    private SeasonalEvent seasonalEvent;

    /** Дейлики можно выполнять каждый день заново. */
    @Column(nullable = false)
    private boolean repeatable;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
