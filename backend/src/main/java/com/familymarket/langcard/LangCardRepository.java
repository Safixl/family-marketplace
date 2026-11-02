package com.familymarket.langcard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LangCardRepository extends JpaRepository<LangCard, Long> {

    List<LangCard> findByChildIdAndCardDateOrderByCreatedAtDesc(Long childId, LocalDate cardDate);

    long countByChildIdAndCardDate(Long childId, LocalDate cardDate);

    List<LangCard> findByChildIdAndCardDateAndStatus(Long childId, LocalDate cardDate, String status);

    /** Сколько карточек дня уже завершено (SUCCESS/FAILED) — лимит 3. */
    long countByChildIdAndCardDateAndStatusIn(Long childId, LocalDate cardDate, List<String> statuses);

    /** Карточки на ручной проверке родителя (статус REVIEW). */
    @Query("""
            SELECT c FROM LangCard c
            WHERE c.status = 'REVIEW' AND c.child.parent.id = :parentId
            ORDER BY c.submittedAt ASC
            """)
    List<LangCard> findByParentReview(@Param("parentId") Long parentId);

    /** Сумма фактически начисленного XP по карточкам языка ребёнка. */
    @Query("SELECT COALESCE(SUM(c.xpEarned), 0) FROM LangCard c WHERE c.child.id = :childId")
    long sumXpByChildId(@Param("childId") Long childId);
}
