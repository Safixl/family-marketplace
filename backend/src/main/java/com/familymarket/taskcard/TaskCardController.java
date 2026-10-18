package com.familymarket.taskcard;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.TaskCardDto;
import com.familymarket.dto.TaskCardSubmitRequest;
import com.familymarket.dto.TaskCardUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TaskCardController {

    private final TaskCardService taskCardService;

    public TaskCardController(TaskCardService taskCardService) {
        this.taskCardService = taskCardService;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/task-cards")
    public List<TaskCardDto> listCards(@RequestParam String skill) {
        return taskCardService.listForParent(CurrentUser.parentId(), skill);
    }

    @PostMapping("/api/parent/task-cards")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskCardDto createCard(@Valid @RequestBody TaskCardUpsertRequest request) {
        return taskCardService.create(CurrentUser.parentId(), request);
    }

    @PutMapping("/api/parent/task-cards/{id}")
    public TaskCardDto updateCard(@PathVariable Long id, @Valid @RequestBody TaskCardUpsertRequest request) {
        return taskCardService.update(CurrentUser.parentId(), id, request);
    }

    @DeleteMapping("/api/parent/task-cards/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable Long id) {
        taskCardService.delete(CurrentUser.parentId(), id);
    }

    /** Запросы на раскрытие карточек (PENDING_PARENT). */
    @GetMapping("/api/parent/task-card-requests")
    public List<TaskCardDto> pendingRequests(@RequestParam(required = false) String skill) {
        return taskCardService.listPendingForParent(CurrentUser.parentId(), skill);
    }

    @PostMapping("/api/parent/task-card-requests/{id}/approve")
    public TaskCardDto approve(@PathVariable Long id) {
        return taskCardService.approve(CurrentUser.parentId(), id);
    }

    @PostMapping("/api/parent/task-card-requests/{id}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@PathVariable Long id) {
        taskCardService.reject(CurrentUser.parentId(), id);
    }

    // ---------- Ребёнок ----------

    @GetMapping("/api/child/task-cards")
    public List<TaskCardDto> childCards(@RequestParam String skill) {
        return taskCardService.listForChild(CurrentUser.childId(), skill);
    }

    @PostMapping("/api/child/task-cards/{id}/take")
    public void take(@PathVariable Long id) {
        taskCardService.take(CurrentUser.childId(), id);
    }

    @PostMapping("/api/child/task-cards/{id}/submit")
    public TaskCardDto submit(@PathVariable Long id, @RequestBody TaskCardSubmitRequest request) {
        return taskCardService.submit(CurrentUser.childId(), id, request);
    }
}