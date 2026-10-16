package com.familymarket.store;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByParentIdOrderByCreatedAtAsc(Long parentId);

    List<Store> findByParentIdAndActiveTrueOrderByCreatedAtAsc(Long parentId);

    Optional<Store> findByIdAndParentId(Long id, Long parentId);

    Optional<Store> findByParentIdAndTemplateType(Long parentId, String templateType);

    List<Store> findByParentIdAndTemplateTypeOrderByCreatedAtAsc(Long parentId, String templateType);

    @Query("select s.parent.id from Store s where s.id = :id")
    Optional<Long> findParentIdById(@Param("id") Long id);

    List<Store> findByParentIdAndSeasonalEventIdOrderByCreatedAtAsc(Long parentId, Long seasonalEventId);
}