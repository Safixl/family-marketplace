package com.familymarket.langcard;

import com.familymarket.child.Child;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * Логическая карточка языка.
 * Авто-задания: CREATED → IN_PROGRESS → SUCCESS/FAILED (порог 80%).
 * Ручные задания: CREATED → IN_PROGRESS → REVIEW (проверка родителя) → SUCCESS/FAILED.
 */
@Entity
@Table(name = "lang_cards")
@Getter
@Setter
public class LangCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "card_date", nullable = false)
    private LocalDate cardDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, length = 32)
    private LangTaskType taskType;

    @Column(nullable = false)
    private int minutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private LangDifficulty difficulty = LangDifficulty.EASY;

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

    /** Базовая награда до множителя родителя. */
    @Column(name = "base_reward", nullable = false)
    private int baseReward;

    /** Множитель родителя 0/1/2 (для ручных заданий). */
    @Column(nullable = false)
    private int multiplier = 1;

    /** Фактически начислено в навык «Иностранный язык» и в «лингво-мили» 1:1. */
    @Column(name = "xp_earned", nullable = false)
    private int xpEarned;

    @Column(name = "parent_comment", length = 300)
    private String parentComment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
