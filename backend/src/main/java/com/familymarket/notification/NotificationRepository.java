package com.familymarket.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByParentIdOrderByCreatedAtDesc(Long parentId);

    long countByParentIdAndStatus(Long parentId, String status);

    Optional<Notification> findByRefTypeAndRefIdAndStatus(String refType, Long refId, String status);

    Optional<Notification> findByIdAndParentId(Long id, Long parentId);
}