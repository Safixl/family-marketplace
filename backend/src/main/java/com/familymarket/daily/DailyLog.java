package com.familymarket.daily;

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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Журнал ежедневных дейликов. Одна строка на ребёнка, навык и день.
 * payload — JSON с деталями (решённые задачи, выученные слова, минуты активности).
 * full_clear = блок пройден без ошибок (бонус +2 XP).
 */
@Entity
@Table(name = "daily_logs")
@Getter
@Setter
public class DailyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    /** Навык: LOGIC / LANG / SPORT / MATH. */
    @Column(nullable = false, length = 32)
    private String skill;

    @Column(nullable = false)
    private LocalDate day;

    /** JSON: детали выполнения. */
    @Column(length = 4000)
    private String payload;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal points = BigDecimal.ZERO;

    @Column(nullable = false)
    private int xp;

    @Column(name = "full_clear", nullable = false)
    private boolean fullClear;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
