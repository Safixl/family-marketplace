package com.familymarket.logiccard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogicTopicRepository extends JpaRepository<LogicTopic, Long> {

    List<LogicTopic> findAllByOrderBySortOrderAsc();
}
