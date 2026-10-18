package com.familymarket.skill;

import com.familymarket.child.Child;
import com.familymarket.store.Store;
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

/**
 * Активированный навык ребёнка: список направлений (READING / MATH / LOGIC / LANG / SPORT / HOME),
 * включённых родителем при активации шаблона навыка.
 */
@Entity
@Table(name = "skill_activations", uniqueConstraints = @UniqueConstraint(columnNames = {"child_id", "skill"}))
@Getter
@Setter
public class SkillActivation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(nullable = false, length = 40)
    private String skill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}