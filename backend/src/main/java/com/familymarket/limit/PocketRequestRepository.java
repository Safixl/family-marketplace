package com.familymarket.limit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PocketRequestRepository extends JpaRepository<PocketRequest, Long> {

    List<PocketRequest> findByChild_ParentIdOrderByCreatedAtDesc(Long parentId);

    List<PocketRequest> findByChildIdOrderByCreatedAtDesc(Long childId);

    Optional<PocketRequest> findByIdAndChild_ParentId(Long id, Long parentId);
}