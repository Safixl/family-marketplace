package com.familymarket.langcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LangCardTaskRepository extends JpaRepository<LangCardTask, Long> {

    List<LangCardTask> findByCardIdOrderByIdAsc(Long cardId);
}
