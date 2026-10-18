package com.familymarket.quest;

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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Состояние квеста для конкретного ребёнка (стадии):
 * AVAILABLE (!) → ACTIVE (?) → SUBMITTED (на проверке) → DONE (одноразовый выполнен)
 * или SLEEPING (повторяемый, ожидание повторного взятия).
 */
@Entity
@Table(name = "child_quest_states", uniqueConstraints = @UniqueConstraint(columnNames = {"child_id", "quest_id"}))
@Getter
@Setter
public class ChildQuestState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE";

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "starts_at")
    private Instant startsAt;

    @Column(name = "next_available_at")
    private Instant nextAvailableAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}