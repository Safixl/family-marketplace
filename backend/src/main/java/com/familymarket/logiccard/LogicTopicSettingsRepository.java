package com.familymarket.logiccard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LogicTopicSettingsRepository extends JpaRepository<LogicTopicSettings, Long> {

    List<LogicTopicSettings> findByParentId(Long parentId);

    Optional<LogicTopicSettings> findByParentIdAndTopicId(Long parentId, Long topicId);
}
