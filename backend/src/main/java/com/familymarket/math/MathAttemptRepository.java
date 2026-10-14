package com.familymarket.math;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MathAttemptRepository extends JpaRepository<MathAttempt, Long> {

    List<MathAttempt> findByChildIdOrderByAttemptedAtDesc(Long childId);

    @Query("select count(a) from MathAttempt a where a.child.id = :childId and a.correct = true")
    long countCorrectByChildId(@Param("childId") Long childId);

    @Query("select count(a) from MathAttempt a where a.child.id = :childId")
    long countByChildId(@Param("childId") Long childId);

    @Query("select coalesce(sum(a.points), 0) from MathAttempt a where a.child.id = :childId and a.correct = true")
    java.math.BigDecimal sumPointsByChildId(@Param("childId") Long childId);

    @Query("select distinct cast(a.attemptedAt as date) from MathAttempt a "
            + "where a.child.id = :childId and a.correct = true order by 1")
    List<java.time.LocalDate> findDistinctCorrectDates(@Param("childId") Long childId);
}