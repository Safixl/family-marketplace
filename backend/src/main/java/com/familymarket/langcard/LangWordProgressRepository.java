package com.familymarket.langcard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LangWordProgressRepository extends JpaRepository<LangWordProgress, Long> {

    Optional<LangWordProgress> findByChildIdAndWordId(Long childId, Long wordId);

    List<LangWordProgress> findByChildIdOrderByStatusAscIdAsc(Long childId);

    List<LangWordProgress> findByChildIdAndStatus(Long childId, LangWordProgress.Status status);

    @Query("SELECT COUNT(p) FROM LangWordProgress p WHERE p.child.id = :childId AND p.status = 'ACTIVE'")
    long countActiveByChildId(@Param("childId") Long childId);
}
