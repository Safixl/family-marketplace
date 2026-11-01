package com.familymarket.dungeon;

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
 * Экипировка ребёнка. isIdentified = false — «нераспознанная вещь»
 * (определяется мудрецом в таверне, только после этого её можно надеть).
 */
@Entity
@Table(name = "child_equipment")
@Getter
@Setter
public class ChildEquipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "child_id", nullable = false)
    private Long childId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id", nullable = false)
    private EquipmentDef equipment;

    @Column(name = "is_identified", nullable = false)
    private boolean identified = false;

    @Column(nullable = false)
    private boolean equipped = false;

    @Column(name = "acquired_at", nullable = false)
    private Instant acquiredAt = Instant.now();
}
