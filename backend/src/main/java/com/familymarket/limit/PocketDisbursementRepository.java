package com.familymarket.limit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PocketDisbursementRepository extends JpaRepository<PocketDisbursement, Long> {

    List<PocketDisbursement> findByChildIdAndWeekStart(Long childId, LocalDate weekStart);
}