package com.familymarket.avatar;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChildAvatarItemRepository extends JpaRepository<ChildAvatarItem, Long> {

    List<ChildAvatarItem> findByChildIdOrderByUnlockedAtDesc(Long childId);

    Optional<ChildAvatarItem> findByChildIdAndItemId(Long childId, Long itemId);

    @Query("select c from ChildAvatarItem c where c.child.id = :childId and c.equipped = true")
    List<ChildAvatarItem> findEquippedByChildId(@Param("childId") Long childId);

    /** Выдать/подтвердить выдачу предмета. */
    boolean existsByChildIdAndItemId(Long childId, Long itemId);
}
