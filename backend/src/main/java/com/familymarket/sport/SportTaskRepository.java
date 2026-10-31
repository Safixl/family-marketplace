package com.familymarket.sport;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SportTaskRepository extends JpaRepository<SportTask, Long> {

    List<SportTask> findByDirectionIdOrderBySortOrderAscIdAsc(Long directionId);
}
