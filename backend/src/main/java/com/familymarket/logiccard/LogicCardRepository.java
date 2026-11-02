package com.familymarket.logiccard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LogicCardRepository extends JpaRepository<LogicCard, Long> {

    Optional<LogicCard> findFirstByChildIdAndCardDateAndFinalLevelOrderByIdDesc(
            Long childId, LocalDate cardDate, String finalLevel);

    List<LogicCard> findByChildIdAndCardDateOrderByCreatedAtDesc(Long childId, LocalDate cardDate);

    long countByChildIdAndCardDate(Long childId, LocalDate cardDate);

    List<LogicCard> findByChildIdAndCardDateAndStatus(Long childId, LocalDate cardDate, String status);

    /** Сколько карточек дня уже завершено (SUCCESS/FAILED) — лимит 3. */
    long countByChildIdAndCardDateAndStatusIn(Long childId, LocalDate cardDate, List<String> statuses);

    List<LogicCard> findByChildIdAndCardDateGreaterThanEqualOrderByCardDateDesc(
            Long childId, LocalDate since);

    /** Запросы на одобрение (карточки статуса REQUESTED) для родителя. */
    @Query("""
            SELECT c FROM LogicCard c
            WHERE c.status = 'REQUESTED' AND c.child.parent.id = :parentId
            ORDER BY c.createdAt ASC
            """)
    List<LogicCard> findByParentRequested(@Param("parentId") Long parentId);

    /** Сумма фактически начисленного XP по карточкам ребёнка (в навык «Логика»). */
    @Query("SELECT COALESCE(SUM(c.xpEarned), 0) FROM LogicCard c WHERE c.child.id = :childId")
    long sumXpByChildId(@Param("childId") Long childId);

    /** Даты дней с успешно решённой карточкой — для стрика и удвоения XP дейлика. */
    @Query("SELECT c.cardDate FROM LogicCard c WHERE c.child.id = :childId AND c.status = 'SUCCESS'")
    List<LocalDate> findSuccessDates(@Param("childId") Long childId);
}
