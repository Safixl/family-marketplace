package com.familymarket.house;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HouseCheckRequestRepository extends JpaRepository<HouseCheckRequest, Long> {

    List<HouseCheckRequest> findByChild_ParentIdOrderByCreatedAtDesc(Long parentId);

    Optional<HouseCheckRequest> findByChildIdAndDay(Long childId, LocalDate day);

    Optional<HouseCheckRequest> findByIdAndChild_ParentId(Long id, Long parentId);
}