package com.familymarket.dungeon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DungeonCharacterRepository extends JpaRepository<DungeonCharacter, Long> {

    Optional<DungeonCharacter> findByChildId(Long childId);

    @Query("select c.childId from DungeonCharacter c")
    List<Long> allChildIds();
}
