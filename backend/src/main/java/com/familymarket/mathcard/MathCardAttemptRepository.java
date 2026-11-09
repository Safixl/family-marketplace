package com.familymarket.mathcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MathCardAttemptRepository extends JpaRepository<MathCardAttempt, Long> {

    /** Число верных ответов ребёнка по всем его карточкам (для достижений). */
    @Query("SELECT COUNT(a) FROM MathCardAttempt a WHERE a.correct = true AND a.task.card.child.id = :childId")
    long countCorrectByChildId(@Param("childId") Long childId);

    /** Попытки по задачам (для родительского просмотра ответов). */
    List<MathCardAttempt> findByTaskIdInOrderByAttemptedAtAsc(List<Long> taskIds);
}