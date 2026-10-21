package com.familymarket.mathcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MathTopicRepository extends JpaRepository<MathTopic, Long> {

    List<MathTopic> findAllByOrderBySortOrderAsc();
}