package com.familymarket.reading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReadingRequestRepository extends JpaRepository<ReadingRequest, Long> {

    List<ReadingRequest> findByChildIdOrderByCreatedAtDesc(Long childId);

    List<ReadingRequest> findByChildIdAndStatusOrderByCreatedAtDesc(Long childId, String status);

    Optional<ReadingRequest> findByIdAndChild_ParentId(Long id, Long parentId);
}