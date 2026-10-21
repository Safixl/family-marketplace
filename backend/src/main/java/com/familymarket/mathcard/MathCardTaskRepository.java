package com.familymarket.mathcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MathCardTaskRepository extends JpaRepository<MathCardTask, Long> {

    List<MathCardTask> findByCardIdOrderByIdAsc(Long cardId);

    List<MathCardTask> findByCardIdIn(List<Long> cardIds);
}