package com.familymarket.reading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReadingBookmarkRepository extends JpaRepository<ReadingBookmark, Long> {

    Optional<ReadingBookmark> findByChildIdAndBookId(Long childId, Long bookId);

    List<ReadingBookmark> findByChildId(Long childId);
}