package com.familymarket.achievement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChildAchievementRepository extends JpaRepository<ChildAchievement, Long> {

    Optional<ChildAchievement> findByChildIdAndAchievementId(Long childId, Long achievementId);

    List<ChildAchievement> findByChildIdOrderByUnlockedAtDesc(Long childId);

    long countByAchievementId(Long achievementId);

    long countByChildIdAndAchievementIdIn(Long childId, List<Long> achievementIds);
}