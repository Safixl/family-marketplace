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

/** Заморозка лимита родителем: ребёнок не может запустить счётчик. */
@Entity
@Table(name = "limit_freeze", uniqueConstraints = @UniqueConstraint(columnNames = {"child_id", "limit_type"}))
@Getter
@Setter
public class LimitFreeze {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "limit_type", nullable = false, length = 20)
    private String limitType;

    @Column(nullable = false)
    private boolean frozen;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}