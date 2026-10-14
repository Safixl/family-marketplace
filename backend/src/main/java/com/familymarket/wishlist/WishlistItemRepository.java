package com.familymarket.wishlist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByChildIdOrderByCreatedAtDesc(Long childId);

    Optional<WishlistItem> findByIdAndChild_ParentId(Long id, Long parentId);
}