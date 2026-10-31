package com.familymarket.sport;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SportCardRepository extends JpaRepository<SportCard, Long> {

    Optional<SportCard> findByChildIdAndCardDate(Long childId, LocalDate cardDate);

    /** Карточки на проверке родителя (REVIEW). */
    @Query("""
            SELECT c FROM SportCard c
            WHERE c.status = 'REVIEW' AND c.child.parent.id = :parentId
            ORDER BY c.submittedAt ASC
            """)
    List<SportCard> findByParentReview(@Param("parentId") Long parentId);

    /** Сумма начисленного XP по карточкам спорта ребёнка. */
    @Query("SELECT COALESCE(SUM(c.xpEarned), 0) FROM SportCard c WHERE c.child.id = :childId")
    long sumXpByChildId(@Param("childId") Long childId);
}
