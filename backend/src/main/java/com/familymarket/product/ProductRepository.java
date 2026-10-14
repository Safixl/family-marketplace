package com.familymarket.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStoreIdOrderByCreatedAtAsc(Long storeId);

    List<Product> findByStoreIdAndActiveTrueOrderByCreatedAtAsc(Long storeId);

    Optional<Product> findByIdAndStore_ParentId(Long id, Long parentId);
}