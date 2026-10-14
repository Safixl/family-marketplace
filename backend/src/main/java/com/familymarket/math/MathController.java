package com.familymarket.math;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.MathSolveRequest;
import com.familymarket.dto.MathSolveResult;
import com.familymarket.dto.MathStatsDto;
import com.familymarket.dto.MathTaskDto;
import com.familymarket.dto.MathTaskUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MathController {

    private final MathService mathService;

    public MathController(MathService mathService) {
        this.mathService = mathService;
    }

    // ---------- Задачи (родитель, личные для ребёнка) ----------

    @GetMapping("/api/parent/children/{childId}/tasks")
    public List<MathTaskDto> listTasks(@PathVariable Long childId) {
        return mathService.listTasks(CurrentUser.parentId(), childId);
    }

    @PostMapping("/api/parent/stores/{storeId}/children/{childId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public MathTaskDto createTask(@PathVariable Long storeId, @PathVariable Long childId,
                                  @Valid @RequestBody MathTaskUpsertRequest request) {
        return mathService.createTask(CurrentUser.parentId(), storeId, childId, request);
    }

    @PutMapping("/api/parent/tasks/{id}")
    public MathTaskDto updateTask(@PathVariable Long id, @Valid @RequestBody MathTaskUpsertRequest request) {
        return mathService.updateTask(CurrentUser.parentId(), id, request);
    }

    @DeleteMapping("/api/parent/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        mathService.deleteTask(CurrentUser.parentId(), id);
    }

    @GetMapping("/api/parent/children/{childId}/math-stats")
    public MathStatsDto childMathStats(@PathVariable Long childId) {
        return mathService.statsForChild(CurrentUser.parentId(), childId);
    }

    // ---------- Ребенок ----------

    @GetMapping("/api/child/tasks")
    public List<MathTaskDto> childTasks() {
        return mathService.childTasks(CurrentUser.childId());
    }

    @PostMapping("/api/child/tasks/{id}/solve")
    public MathSolveResult solve(@PathVariable Long id, @Valid @RequestBody MathSolveRequest request) {
        return mathService.solve(CurrentUser.childId(), id, request);
    }

    @GetMapping("/api/child/math-stats")
    public MathStatsDto childMathStats() {
        return mathService.childStats(CurrentUser.childId());
    }
}