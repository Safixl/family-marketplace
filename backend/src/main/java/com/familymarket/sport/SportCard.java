package com.familymarket.sport;

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
 * Дейлик-карточка спорта: 1 в день, одно направление, проверяет родитель
 * с множителем 0/1/2 (на множитель умножаются все награды).
 */
@Entity
@Table(name = "sport_cards")
@Getter
@Setter
public class SportCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "card_date", nullable = false)
    private LocalDate cardDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "direction_id", nullable = false)
    private SportDirection direction;

    @Column(nullable = false, length = 20)
    private String status = "CREATED"; // CREATED / REVIEW / SUCCESS / FAILED

    @Column(name = "base_reward", nullable = false)
    private int baseReward = 10;

    @Column(nullable = false)
    private int multiplier = 1;

    @Column(name = "xp_earned", nullable = false)
    private int xpEarned;

    @Column(name = "parent_comment", length = 300)
    private String parentComment;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
