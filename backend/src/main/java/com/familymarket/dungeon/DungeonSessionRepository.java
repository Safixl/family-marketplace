package com.familymarket.dungeon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DungeonSessionRepository extends JpaRepository<DungeonSession, Long> {

    Optional<DungeonSession> findFirstByChildIdOrderByStartedAtDesc(Long childId);

    Optional<DungeonSession> findFirstByChildIdAndStatusInOrderByStartedAtDesc(Long childId, List<String> statuses);

    List<DungeonSession> findByStatusAndResumeDay(String status, java.time.LocalDate resumeDay);
}
