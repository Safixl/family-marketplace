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

/** Запрос ребёнка на новое направление спорта/хобби («Хочу заниматься карате»). */
@Entity
@Table(name = "sport_requests")
@Getter
@Setter
public class SportRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 300)
    private String comment;

    @Column(nullable = false, length = 16)
    private String status = "PENDING"; // PENDING / RESOLVED / REJECTED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
