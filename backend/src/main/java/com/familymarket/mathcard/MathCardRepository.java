package com.familymarket.mathcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MathCardRepository extends JpaRepository<MathCard, Long> {

    Optional<MathCard> findFirstByChildIdAndCardDateOrderByIdDesc(Long childId, LocalDate cardDate);

    Optional<MathCard> findFirstByChildIdAndCardDateAndFinalLevelOrderByIdDesc(
            Long childId, LocalDate cardDate, String finalLevel);

    List<MathCard> findByChildIdAndCardDateGreaterThanEqualOrderByCardDateDesc(
            Long childId, LocalDate since);

    long countByChildIdAndCardDate(Long childId, LocalDate cardDate);
}