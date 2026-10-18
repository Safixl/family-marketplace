package com.familymarket.limit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface PocketExtensionRepository extends JpaRepository<PocketExtension, Long> {

    Optional<PocketExtension> findByChildIdAndWeekStart(Long childId, LocalDate weekStart);
}