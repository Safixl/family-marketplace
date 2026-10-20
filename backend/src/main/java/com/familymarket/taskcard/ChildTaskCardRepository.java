package com.familymarket.taskcard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ChildTaskCardRepository extends JpaRepository<ChildTaskCard, Long> {

    List<ChildTaskCard> findByChildIdAndDay(Long childId, LocalDate day);

    Optional<ChildTaskCard> findByChildIdAndCardIdAndDay(Long childId, Long cardId, LocalDate day);

    List<ChildTaskCard> findByChildIdAndStatus(Long childId, String status);

    Optional<ChildTaskCard> findByIdAndChildId(Long id, Long childId);

    List<ChildTaskCard> findByCard_ParentIdAndStatus(Long parentId, String status);

    /** Успешно завершённые карточки математики (для достижений «Испытатель тестов»). */
    @Query("select count(c) from ChildTaskCard c where c.child.id = :childId and c.status = 'DONE' and c.card.skill = 'MATH'")
    long countDoneMathByChildId(@Param("childId") Long childId);
}