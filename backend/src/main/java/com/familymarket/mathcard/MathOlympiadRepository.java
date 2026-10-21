package com.familymarket.mathcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MathOlympiadRepository extends JpaRepository<MathOlympiadCard, Long> {

    List<MathOlympiadCard> findAllByOrderByIdAsc();
}