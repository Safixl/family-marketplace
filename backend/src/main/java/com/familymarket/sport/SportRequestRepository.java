package com.familymarket.sport;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SportRequestRepository extends JpaRepository<SportRequest, Long> {

    @Query("""
            SELECT r FROM SportRequest r
            WHERE r.status = 'PENDING' AND r.child.parent.id = :parentId
            ORDER BY r.createdAt ASC
            """)
    List<SportRequest> findPendingByParent(@Param("parentId") Long parentId);

    List<SportRequest> findByChildIdOrderByCreatedAtDesc(Long childId);
}
