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

/**
 * Направление навыка «Спорт и хобби»: дефолтная «Физкультура» + направления,
 * созданные родителем по запросам ребёнка (каратэ, шахматы, рисование…). Максимум 6.
 */
@Entity
@Table(name = "sport_directions")
@Getter
@Setter
public class SportDirection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 8)
    private String icon = "⚽";

    @Column(nullable = false, length = 16)
    private String status = "ACTIVE"; // ACTIVE / ARCHIVED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
