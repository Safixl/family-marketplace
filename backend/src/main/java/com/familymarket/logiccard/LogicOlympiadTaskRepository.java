package com.familymarket.logiccard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogicOlympiadTaskRepository extends JpaRepository<LogicOlympiadTask, Long> {

    List<LogicOlympiadTask> findByCardIdOrderByIdAsc(Long cardId);
}
