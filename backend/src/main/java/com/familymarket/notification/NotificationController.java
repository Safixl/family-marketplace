package com.familymarket.notification;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.NotificationDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Родитель: лента уведомлений и счётчик новых. */
@RestController
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/api/parent/notifications")
    public List<NotificationDto> notifications() {
        return notificationService.listForParent(CurrentUser.parentId());
    }

    @GetMapping("/api/parent/notifications/count")
    public long count() {
        return notificationService.countNew(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/notifications/{id}/done")
    public void done(@PathVariable Long id) {
        notificationService.markDone(CurrentUser.parentId(), id);
    }
}