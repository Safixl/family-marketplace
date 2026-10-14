package com.familymarket.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByChildIdOrderByCreatedAtDesc(Long childId);

    List<InventoryItem> findByChildIdAndStatusOrderByCreatedAtDesc(Long childId, String status);

    List<InventoryItem> findByChild_ParentIdAndStatusOrderByCreatedAtDesc(Long parentId, String status);

    Optional<InventoryItem> findByIdAndChildId(Long id, Long childId);

    Optional<InventoryItem> findByIdAndChild_ParentId(Long id, Long parentId);

    boolean existsByPurchaseId(Long purchaseId);
}
