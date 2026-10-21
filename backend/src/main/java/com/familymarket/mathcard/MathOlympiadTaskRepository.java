package com.familymarket.mathcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MathOlympiadTaskRepository extends JpaRepository<MathOlympiadTask, Long> {

    List<MathOlympiadTask> findByCardIdOrderByIdAsc(Long cardId);
}