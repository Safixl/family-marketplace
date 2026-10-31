package com.familymarket.logiccard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogicOlympiadRepository extends JpaRepository<LogicOlympiadCard, Long> {

    List<LogicOlympiadCard> findAllByOrderByIdAsc();
}
