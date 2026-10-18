package com.familymarket.taskcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ChildTaskCardRepository extends JpaRepository<ChildTaskCard, Long> {

    List<ChildTaskCard> findByChildIdAndDay(Long childId, LocalDate day);

    Optional<ChildTaskCard> findByChildIdAndCardIdAndDay(Long childId, Long cardId, LocalDate day);

    List<ChildTaskCard> findByChildIdAndStatus(Long childId, String status);

    Optional<ChildTaskCard> findByIdAndChildId(Long id, Long childId);

    List<ChildTaskCard> findByCard_ParentIdAndStatus(Long parentId, String status);
}