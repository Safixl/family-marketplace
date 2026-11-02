package com.familymarket.sport;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.SportCardDto;
import com.familymarket.dto.SportCardReviewDto;
import com.familymarket.dto.SportReviewRequest;
import com.familymarket.dto.SportDirectionCreateRequest;
import com.familymarket.dto.SportDirectionFullDto;
import com.familymarket.dto.SportRequestCreateRequest;
import com.familymarket.dto.SportRequestDto;
import com.familymarket.dto.SportTaskDto;
import com.familymarket.dto.SportTaskUpsertRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Эндпоинты навыка «Спорт и хобби».
 * Ребёнок: направления дня, генерация дейлика, «выполнено», запросы на новые направления.
 * Родитель: создание направлений (до 6), редактор заданий, проверка дейликов ×0/×1/×2.
 */
@RestController
@RequestMapping
public class SportCardController {

    private final SportCardService service;

    public SportCardController(SportCardService service) {
        this.service = service;
    }

    // ---------- Ребёнок ----------

    @GetMapping("/api/child/sport-day")
    public SportCardService.SportDayDto day() {
        return service.day(CurrentUser.childId());
    }

    @PostMapping("/api/child/sport-cards/generate")
    public SportCardDto generate(@RequestBody SportGenerateRequest request) {
        return service.generate(CurrentUser.childId(), request.directionId());
    }

    @PostMapping("/api/child/sport-cards/{cardId}/submit")
    public SportCardDto submit(@PathVariable Long cardId) {
        return service.submit(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/sport-requests")
    public void requestDirection(@RequestBody SportRequestCreateRequest request) {
        service.requestDirection(CurrentUser.childId(), request.name(), request.comment());
    }

    @GetMapping("/api/child/sport-requests")
    public List<SportRequestDto> childRequests() {
        return service.childRequests(CurrentUser.childId());
    }

    public record SportGenerateRequest(Long directionId) {
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/sport-requests")
    public List<SportRequestDto> parentRequests() {
        return service.parentRequests(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/sport-directions")
    public SportDirectionFullDto createDirection(@RequestBody SportDirectionCreateRequest request) {
        var d = service.createDirection(CurrentUser.parentId(), request.childId(), request.name(), request.icon(), request.requestId());
        return SportDirectionFullDto.of(d, 0);
    }

    @GetMapping("/api/parent/sport-directions-list")
    public List<SportCardService.SportDirectionInfo> directions(@RequestParam Long childId) {
        return service.parentDirections(CurrentUser.parentId(), childId);
    }

    @PostMapping("/api/parent/sport-requests/{requestId}/reject")
    public void rejectRequest(@PathVariable Long requestId) {
        service.rejectRequest(CurrentUser.parentId(), requestId);
    }

    @GetMapping("/api/parent/sport-directions/{directionId}/tasks")
    public List<SportTaskDto> tasks(@PathVariable Long directionId) {
        return service.tasks(directionId).stream()
                .map(SportTaskDto::of)
                .toList();
    }

    @PostMapping("/api/parent/sport-tasks")
    public SportTaskDto addTask(@RequestBody SportTaskUpsertRequest request) {
        return SportTaskDto.of(service.addTask(CurrentUser.parentId(), request.directionId(), request.title(), request.description(),
                request.gradeMin(), request.gradeMax()));
    }

    @PutMapping("/api/parent/sport-tasks/{taskId}")
    public SportTaskDto updateTask(@PathVariable Long taskId, @RequestBody SportTaskUpsertRequest request) {
        return SportTaskDto.of(service.updateTask(CurrentUser.parentId(), taskId, request.title(), request.description(),
                request.gradeMin(), request.gradeMax()));
    }

    @DeleteMapping("/api/parent/sport-tasks/{taskId}")
    public void deleteTask(@PathVariable Long taskId) {
        service.deleteTask(CurrentUser.parentId(), taskId);
    }

    @GetMapping("/api/parent/sport-card-reviews")
    public List<SportCardReviewDto> reviews() {
        return service.parentReviews(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/sport-card-reviews/{cardId}/review")
    public void review(@PathVariable Long cardId, @RequestBody SportReviewRequest request) {
        service.review(CurrentUser.parentId(), cardId, request.multiplier(), request.comment());
    }
}
