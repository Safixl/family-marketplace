package com.familymarket.limit;

import com.familymarket.child.Child;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Базовые лимиты ребёнка: минуты в день (ТВ/ПК/приставка/телефон/планшет)
 * и карманные деньги в рублях в неделю.
 */
@Entity
@Table(name = "child_limits")
@Getter
@Setter
public class ChildLimit {

    @Id
    @Column(name = "child_id")
    private Long childId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", insertable = false, updatable = false)
    private Child child;

    @Column(name = "tv_minutes", nullable = false)
    private int tvMinutes;

    @Column(name = "pc_minutes", nullable = false)
    private int pcMinutes;

    @Column(name = "console_minutes", nullable = false)
    private int consoleMinutes;

    @Column(name = "phone_minutes", nullable = false)
    private int phoneMinutes;

    @Column(name = "tablet_minutes", nullable = false)
    private int tabletMinutes;

    @Column(name = "pocket_weekly", nullable = false)
    private int pocketWeekly;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}