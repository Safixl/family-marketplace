package com.familymarket.achievement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChildTrackedAchievementRepository extends JpaRepository<ChildTrackedAchievement, Long> {

    List<ChildTrackedAchievement> findByChildId(Long childId);

    Optional<ChildTrackedAchievement> findByChildIdAndAchievementId(Long childId, Long achievementId);
}