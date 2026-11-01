package com.familymarket.dungeon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChildEquipmentRepository extends JpaRepository<ChildEquipment, Long> {

    List<ChildEquipment> findByChildIdOrderByAcquiredAtDesc(Long childId);

    List<ChildEquipment> findByChildIdAndEquippedTrue(Long childId);

    Optional<ChildEquipment> findByIdAndChildId(Long id, Long childId);
}
