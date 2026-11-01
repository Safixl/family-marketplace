package com.familymarket.dungeon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EquipmentDefRepository extends JpaRepository<EquipmentDef, Long> {

    Optional<EquipmentDef> findByCode(String code);
}
