package com.familymarket.limit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LimitEventRepository extends JpaRepository<LimitEvent, Long> {

    List<LimitEvent> findByChildIdOrderByCreatedAtDesc(Long childId);
}