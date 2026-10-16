package com.familymarket.seasonal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SeasonalEventRepository extends JpaRepository<SeasonalEvent, Long> {

    List<SeasonalEvent> findByParentIdOrderByStartsAtDesc(Long parentId);

    @Query("select e from SeasonalEvent e where e.parent.id = :parentId and e.active = true " +
            "and e.startsAt <= :today and e.endsAt >= :today")
    List<SeasonalEvent> findOpenForParent(@Param("parentId") Long parentId, @Param("today") LocalDate today);
}
