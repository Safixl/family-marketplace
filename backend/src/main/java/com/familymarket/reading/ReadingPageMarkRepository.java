package com.familymarket.reading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReadingPageMarkRepository extends JpaRepository<ReadingPageMark, Long> {

    List<ReadingPageMark> findByChildIdAndDayOrderByCreatedAtAsc(Long childId, LocalDate day);

    List<ReadingPageMark> findByChildIdAndDayBeforeOrderByCreatedAtDesc(Long childId, LocalDate day);
}