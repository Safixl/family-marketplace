package com.familymarket.reading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReadingBookRepository extends JpaRepository<ReadingBook, Long> {

    List<ReadingBook> findByChildIdOrderByCreatedAtAsc(Long childId);

    List<ReadingBook> findByChildIdAndActiveTrueOrderByCreatedAtAsc(Long childId);

    Optional<ReadingBook> findByIdAndStore_ParentId(Long id, Long parentId);
}