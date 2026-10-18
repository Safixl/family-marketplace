package com.familymarket.taskcard;

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
import java.time.LocalDate;

/**
 * Взятая ребёнком карточка: PENDING_PARENT (запрос родителю) → REVEALED (раскрыта,
 * старт таймера) → DONE / FAILED.
 */
@Entity
@Table(name = "child_task_cards", uniqueConstraints = @UniqueConstraint(columnNames = {"child_id", "card_id", "day"}))
@Getter
@Setter
public class ChildTaskCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_id", nullable = false)
    private TaskCard card;

    @Column(nullable = false)
    private LocalDate day;

    @Column(nullable = false, length = 20)
    private String status = "PENDING_PARENT";

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "answers_json", length = 8000)
    private String answersJson;

    @Column(name = "result_percent")
    private Integer resultPercent;
}