package com.familymarket.dungeon;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Каталог экипировки (выпадает из сундуков и боссов).
 * slot: WEAPON / ARMOR / TRINKET; rarity: COMMON / UNCOMMON / RARE / EPIC / LEGENDARY.
 */
@Entity
@Table(name = "equipment_defs")
@Getter
@Setter
public class EquipmentDef {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 16)
    private String slot;

    @Column(nullable = false, length = 16)
    private String rarity;

    @Column(name = "stat_multiplier", nullable = false, precision = 5, scale = 2)
    private BigDecimal statMultiplier = BigDecimal.ONE;

    @Column(nullable = false, length = 8)
    private String icon = "🗡️";

    @Column(length = 300)
    private String description;
}
