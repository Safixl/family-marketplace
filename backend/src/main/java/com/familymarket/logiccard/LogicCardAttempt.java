package com.familymarket.logiccard;

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

/** Попытка ответа на задачу логической карточки. */
@Entity
@Table(name = "logic_card_attempts")
@Getter
@Setter
public class LogicCardAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private LogicCardTask task;

    @Column(nullable = false, length = 100)
    private String answer;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt;
}
