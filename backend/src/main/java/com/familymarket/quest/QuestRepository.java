package com.familymarket.quest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestRepository extends JpaRepository<Quest, Long> {

    List<Quest> findByParentIdOrderByCreatedAtDesc(Long parentId);

    /** Активные квесты родителя для ребёнка: общие (child=null) или персональные. */
    @Query("select q from Quest q where q.parent.id = :parentId and q.active = true " +
            "and (q.child is null or q.child.id = :childId) order by q.createdAt desc")
    List<Quest> findActiveForChild(@Param("parentId") Long parentId, @Param("childId") Long childId);

    @Query("select q from Quest q where q.parent.id = :parentId and q.active = true " +
            "and q.type = 'SEASONAL' and q.seasonalEvent.id = :eventId")
    List<Quest> findActiveSeasonal(@Param("parentId") Long parentId, @Param("eventId") Long eventId);
}
