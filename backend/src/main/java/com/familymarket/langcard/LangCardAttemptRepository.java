package com.familymarket.langcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LangCardAttemptRepository extends JpaRepository<LangCardAttempt, Long> {

    List<LangCardAttempt> findByTaskIdIn(List<Long> taskIds);
}
