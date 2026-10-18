package com.familymarket.notification;

import com.familymarket.child.ChildRepository;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.NotificationDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ChildRepository childRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               ChildRepository childRepository) {
        this.notificationRepository = notificationRepository;
        this.childRepository = childRepository;
    }

    /** Создать уведомление родителю ребёнка. */
    @Transactional
    public void create(Long childId, String type, String title, String payload, String refType, Long refId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Notification notification = new Notification();
        notification.setParent(childRepository.getReferenceById(childId).getParent());
        notification.setChild(childRepository.getReferenceById(childId));
        notification.setType(type);
        notification.setTitle(title);
        notification.setPayload(payload);
        notification.setRefType(refType);
        notification.setRefId(refId);
        notification.setStatus("NEW");
        notification.setCreatedAt(Instant.now());
        notificationRepository.save(notification);
    }

    /** Создать уведомление напрямую для родителя (без привязки к ребёнку, напр. события). */
    @Transactional
    public void createForParent(Long parentId, Long childId, String type, String title, String payload,
                                String refType, Long refId) {
        Notification notification = new Notification();
        notification.setParent(childRepository.getReferenceById(childId).getParent());
        notification.setChild(childRepository.getReferenceById(childId));
        notification.setType(type);
        notification.setTitle(title);
        notification.setPayload(payload);
        notification.setRefType(refType);
        notification.setRefId(refId);
        notification.setStatus("NEW");
        notification.setCreatedAt(Instant.now());
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public java.util.List<NotificationDto> listForParent(Long parentId) {
        return notificationRepository.findByParentIdOrderByCreatedAtDesc(parentId)
                .stream().map(NotificationDto::from).toList();
    }

    @Transactional(readOnly = true)
    public long countNew(Long parentId) {
        return notificationRepository.countByParentIdAndStatus(parentId, "NEW");
    }

    @Transactional
    public void markDone(Long parentId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndParentId(notificationId, parentId)
                .orElseThrow(() -> new NotFoundException("Уведомление не найдено"));
        notification.setStatus("DONE");
        notificationRepository.save(notification);
    }

    /** Автоматическое погашение по ссылке (refType + refId) после ответа родителя. */
    @Transactional
    public void markDoneByRef(String refType, Long refId) {
        notificationRepository.findByRefTypeAndRefIdAndStatus(refType, refId, "NEW")
                .ifPresent(n -> {
                    n.setStatus("DONE");
                    notificationRepository.save(n);
                });
    }

    /** Погасить все открытые уведомления указанного типа для ребёнка (напр. POCKET после «Выдано»). */
    @Transactional
    public void markDoneForChild(String type, Long childId) {
        // нагрузка небольшая — фильтруем список
        notificationRepository.findByParentIdOrderByCreatedAtDesc(
                        childRepository.findParentIdById(childId).orElseThrow(() -> new NotFoundException("Ребенок не найден")))
                .stream()
                .filter(n -> type.equals(n.getType()) && childId.equals(n.getChild().getId()) && "NEW".equals(n.getStatus()))
                .forEach(n -> {
                    n.setStatus("DONE");
                    notificationRepository.save(n);
                });
    }
}