package com.familymarket.mathcard;

import com.familymarket.child.Child;
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
import java.time.LocalDate;

/**
 * Сгенерированная математическая карточка (история для анти-дублей 30 дней).
 * Жизненный цикл: CREATED → REQUESTED → APPROVED → IN_PROGRESS → SUCCESS/FAILED.
 */
@Entity
@Table(name = "math_cards")
@Getter
@Setter
public class MathCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "card_date", nullable = false)
    private LocalDate cardDate;

    @Column(name = "final_level", nullable = false, length = 16)
    private String finalLevel;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "task_count", nullable = false)
    private int taskCount;

    @Column(name = "task_types", nullable = false, length = 200)
    private String taskTypes;

    @Column(nullable = false)
    private int minutes;

    @Column(nullable = false, length = 20)
    private String status = "CREATED";

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "deadline")
    private Instant deadline;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "result_percent")
    private Integer resultPercent;

    /** Награда за успех (по уровню карточки), при 100% удваивается. */
    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    /** Фактически начислено в навык «Математика» (за примеры + успех). */
    @Column(name = "xp_earned", nullable = false)
    private int xpEarned;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}