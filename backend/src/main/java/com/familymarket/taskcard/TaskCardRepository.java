package com.familymarket.taskcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskCardRepository extends JpaRepository<TaskCard, Long> {

    List<TaskCard> findByParentIdAndSkillOrderByCreatedAtDesc(Long parentId, String skill);

    List<TaskCard> findByParentIdAndSkillAndActiveTrueOrderByCreatedAtDesc(Long parentId, String skill);

    Optional<TaskCard> findByIdAndParentId(Long id, Long parentId);
}