package com.familymarket.mathcard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MathCardRepository extends JpaRepository<MathCard, Long> {

    Optional<MathCard> findFirstByChildIdAndCardDateOrderByIdDesc(Long childId, LocalDate cardDate);

    Optional<MathCard> findFirstByChildIdAndCardDateAndFinalLevelOrderByIdDesc(
            Long childId, LocalDate cardDate, String finalLevel);

    List<MathCard> findByChildIdAndCardDateOrderByCreatedAtDesc(Long childId, LocalDate cardDate);

    List<MathCard> findByChildIdAndCardDateAndStatus(Long childId, LocalDate cardDate, String status);

    /** Сколько карточек дня уже завершено (SUCCESS/FAILED) — лимит 3. */
    long countByChildIdAndCardDateAndStatusIn(Long childId, LocalDate cardDate, List<String> statuses);

    List<MathCard> findByChildIdAndCardDateGreaterThanEqualOrderByCardDateDesc(
            Long childId, LocalDate since);

    long countByChildIdAndCardDate(Long childId, LocalDate cardDate);

    /** Запросы на одобрение (карточки статуса REQUESTED) для родителя. */
    @Query("""
            SELECT c FROM MathCard c
            WHERE c.status = 'REQUESTED' AND c.child.parent.id = :parentId
            ORDER BY c.createdAt ASC
            """)
    List<MathCard> findByParentRequested(@Param("parentId") Long parentId);

    /** Сумма фактически начисленного XP по карточкам ребёнка (в навык «Математика»). */
    @Query("SELECT COALESCE(SUM(c.xpEarned), 0) FROM MathCard c WHERE c.child.id = :childId")
    long sumXpByChildId(@Param("childId") Long childId);
}