package com.familymarket.sport;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SportDirectionRepository extends JpaRepository<SportDirection, Long> {

    List<SportDirection> findByChildIdAndStatusOrderByIdAsc(Long childId, String status);

    List<SportDirection> findByChildIdOrderByIdAsc(Long childId);

    long countByChildIdAndStatus(Long childId, String status);
}
