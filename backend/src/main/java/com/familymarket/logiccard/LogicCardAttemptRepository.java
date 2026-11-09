package com.familymarket.logiccard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogicCardAttemptRepository extends JpaRepository<LogicCardAttempt, Long> {

    /** Попытки по задачам (для родительского просмотра ответов). */
    List<LogicCardAttempt> findByTaskIdInOrderByAttemptedAtAsc(List<Long> taskIds);
}
