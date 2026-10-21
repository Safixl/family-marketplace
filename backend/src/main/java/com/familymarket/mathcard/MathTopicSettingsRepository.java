package com.familymarket.mathcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MathTopicSettingsRepository extends JpaRepository<MathTopicSettings, Long> {

    List<MathTopicSettings> findByParentId(Long parentId);

    Optional<MathTopicSettings> findByParentIdAndTopicId(Long parentId, Long topicId);
}