package com.familymarket.sport;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SportCardTaskRepository extends JpaRepository<SportCardTask, Long> {

    List<SportCardTask> findByCardIdOrderByIdAsc(Long cardId);
}
