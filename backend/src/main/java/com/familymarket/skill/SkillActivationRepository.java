package com.familymarket.skill;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillActivationRepository extends JpaRepository<SkillActivation, Long> {

    List<SkillActivation> findByChildId(Long childId);

    List<SkillActivation> findByChild_ParentId(Long parentId);

    Optional<SkillActivation> findByChildIdAndSkill(Long childId, String skill);
}