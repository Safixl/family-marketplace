package com.familymarket.balance;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BalanceRepository extends JpaRepository<Balance, Long> {

    List<Balance> findByChild_ParentId(Long parentId);

    List<Balance> findByChildIdOrderByStoreIdAsc(Long childId);

    Optional<Balance> findByChildIdAndStoreId(Long childId, Long storeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Balance b where b.child.id = :childId and b.store.id = :storeId")
    Optional<Balance> findByChildIdAndStoreIdForUpdate(@Param("childId") Long childId,
                                                       @Param("storeId") Long storeId);

    @Query("select coalesce(sum(b.amount), 0) from Balance b where b.child.id = :childId")
    java.math.BigDecimal sumByChildId(@Param("childId") Long childId);
}