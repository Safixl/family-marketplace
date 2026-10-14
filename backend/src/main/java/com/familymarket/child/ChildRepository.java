package com.familymarket.child;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChildRepository extends JpaRepository<Child, Long> {

    List<Child> findByParentIdOrderByCreatedAtAsc(Long parentId);

    Optional<Child> findByIdAndParentId(Long id, Long parentId);

    Optional<Child> findByAccessKeyAndActiveTrue(String accessKey);

    @Query("select c.parent.id from Child c where c.id = :id")
    Optional<Long> findParentIdById(@Param("id") Long id);
}