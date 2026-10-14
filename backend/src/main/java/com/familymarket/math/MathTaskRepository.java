package com.familymarket.math;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MathTaskRepository extends JpaRepository<MathTask, Long> {

    List<MathTask> findByChildIdOrderByCreatedAtAsc(Long childId);

    List<MathTask> findByChildIdAndActiveTrueOrderByCreatedAtAsc(Long childId);

    Optional<MathTask> findByIdAndStore_ParentId(Long id, Long parentId);

    /**
     * Активные задачи ребёнка, у которых ещё нет попыток решения.
     */
    @Query("select t from MathTask t where t.child.id = :childId and t.active = true "
            + "and not exists (select a from MathAttempt a where a.task.id = t.id and a.child.id = :childId) "
            + "order by t.createdAt asc")
    List<MathTask> findAvailableForChild(@Param("childId") Long childId);
}