package com.familymarket.limit;

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

/** Событие тарификации: запуск/остановка счётчика лимита (для контроля родителя). */
@Entity
@Table(name = "limit_events")
@Getter
@Setter
public class LimitEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "limit_type", nullable = false, length = 20)
    private String limitType;

    /** START / STOP */
    @Column(nullable = false, length = 20)
    private String action;

    @Column(nullable = false)
    private int seconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}