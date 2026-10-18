package com.familymarket.limit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LimitFreezeRepository extends JpaRepository<LimitFreeze, Long> {

    Optional<LimitFreeze> findByChildIdAndLimitType(Long childId, String limitType);

    List<LimitFreeze> findByChildId(Long childId);
}