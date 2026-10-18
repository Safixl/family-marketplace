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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Расход лимита по дням. День лимита начинается в 09:00 МСК.
 * used_seconds — потрачено, extended_seconds — одноразовые увеличения на сегодня
 * (могут превышать базовый лимит), running — идёт ли счётчик.
 */
@Entity
@Table(name = "limit_usage", uniqueConstraints = @UniqueConstraint(columnNames = {"child_id", "limit_type", "day"}))
@Getter
@Setter
public class LimitUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    /** TV / PC / CONSOLE / PHONE / TABLET */
    @Column(name = "limit_type", nullable = false, length = 20)
    private String limitType;

    @Column(nullable = false)
    private LocalDate day;

    @Column(name = "used_seconds", nullable = false)
    private int usedSeconds;

    @Column(name = "extended_seconds", nullable = false)
    private int extendedSeconds;

    @Column(nullable = false)
    private boolean running;

    @Column(name = "started_at")
    private Instant startedAt;
}