package com.familymarket.audit;

import com.familymarket.user.User;
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

/** Запись журнала аудита: ключевое действие родителя (кто/что/когда). */
@Entity
@Table(name = "audit_log")
@Getter
@Setter
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    /** Код действия: PURCHASE_APPROVE, PURCHASE_REJECT, ACHIEVEMENT_GRANT, QUEST_CREATE и т.п. */
    @Column(nullable = false, length = 64)
    private String action;

    /** Тип сущности: PURCHASE, ACHIEVEMENT, QUEST, STORE... */
    @Column(length = 64)
    private String entity;

    /** Человекочитаемые детали действия. */
    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
