package com.familymarket.deposit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepositRepository extends JpaRepository<Deposit, Long> {

    Optional<Deposit> findByChildIdAndStoreId(Long childId, Long storeId);

    List<Deposit> findByChildIdOrderByCreatedAtAsc(Long childId);
}
