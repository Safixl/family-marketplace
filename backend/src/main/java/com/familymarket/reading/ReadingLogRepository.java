package com.familymarket.reading;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReadingLogRepository extends JpaRepository<ReadingLog, Long> {

    List<ReadingLog> findByChildIdOrderByReadAtDesc(Long childId);

    List<ReadingLog> findByChildIdAndStatusOrderByReadAtDesc(Long childId, String status);

    Optional<ReadingLog> findByIdAndChild_ParentId(Long id, Long parentId);

    boolean existsByChildIdAndBookIdAndStatus(Long childId, Long bookId, String status);

    @Query("select count(l) from ReadingLog l where l.child.id = :childId and l.status = 'APPROVED'")
    long countApprovedByChildId(@Param("childId") Long childId);

    @Query("select coalesce(sum(l.points), 0) from ReadingLog l where l.child.id = :childId and l.status = 'APPROVED'")
    java.math.BigDecimal sumPointsByChildId(@Param("childId") Long childId);

    @Query("select coalesce(sum(l.book.pages), 0) from ReadingLog l where l.child.id = :childId and l.status = 'APPROVED'")
    long sumPagesByChildId(@Param("childId") Long childId);

    @Query("select distinct l.readAt from ReadingLog l where l.child.id = :childId and l.status = 'APPROVED'")
    List<java.time.LocalDate> findDistinctApprovedDates(@Param("childId") Long childId);

    /** Одобренные книги ребёнка (для жанров, серий, «тяжёлых» книг). */
    @Query("select l.book from ReadingLog l where l.child.id = :childId and l.status = 'APPROVED'")
    List<ReadingBook> findApprovedBooksByChildId(@Param("childId") Long childId);
}