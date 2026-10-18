package com.familymarket.limit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LimitUsageRepository extends JpaRepository<LimitUsage, Long> {

    Optional<LimitUsage> findByChildIdAndLimitTypeAndDay(Long childId, String limitType, LocalDate day);

    List<LimitUsage> findByChildIdAndDay(Long childId, LocalDate day);
}