package com.familymarket.avatar;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvatarItemRepository extends JpaRepository<AvatarItem, Long> {

    List<AvatarItem> findByParentIdOrderByCategoryAscCreatedAtAsc(Long parentId);
}
