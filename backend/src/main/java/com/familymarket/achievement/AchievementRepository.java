package com.familymarket.achievement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findByParentIdOrderByCreatedAtDesc(Long parentId);

    List<Achievement> findByParentIdOrderByCreatedAtAsc(Long parentId);

    Optional<Achievement> findByIdAndParentId(Long id, Long parentId);

    long countByParentIdAndSkill(Long parentId, String skill);

    List<Achievement> findByParentIdAndSkill(Long parentId, String skill);
}