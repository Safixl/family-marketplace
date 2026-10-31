package com.familymarket.logiccard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogicCardTaskRepository extends JpaRepository<LogicCardTask, Long> {

    List<LogicCardTask> findByCardIdOrderByIdAsc(Long cardId);

    List<LogicCardTask> findByCardIdIn(List<Long> cardIds);
}
