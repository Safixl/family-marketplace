package com.familymarket.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByChildIdOrderByCreatedAtDesc(Long childId);

    List<Purchase> findByChildIdAndStatus(Long childId, PurchaseStatus status);

    List<Purchase> findByChild_ParentIdOrderByCreatedAtDesc(Long parentId);

    List<Purchase> findByChild_ParentIdAndStatusOrderByCreatedAtDesc(Long parentId, PurchaseStatus status);

    Optional<Purchase> findByIdAndChild_ParentId(Long id, Long parentId);

    long countByProductIdAndChildIdAndStatusIn(Long productId, Long childId,
                                               Collection<PurchaseStatus> statuses);

    boolean existsByProductIdAndChildIdAndStatus(Long productId, Long childId, PurchaseStatus status);

    @Query("select count(p) from Purchase p where p.child.id = :childId and p.status = 'PAID' "
            + "and p.store.templateType = 'HOME'")
    long countPaidInHomeStores(@Param("childId") Long childId);
}