package com.familymarket.mathcard;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.MathCardApprovalDto;
import com.familymarket.dto.MathCardDto;
import com.familymarket.dto.MathCardGenerateRequest;
import com.familymarket.dto.MathCardSubmitRequest;
import com.familymarket.dto.MathCardSubmitResult;
import com.familymarket.dto.MathTopicDto;
import com.familymarket.dto.MathTopicSettingsRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Эндпоинты микросервиса динамических математических карточек.
 * Родитель: темы (тумблеры) + матрица базовой сложности + одобрение запросов.
 * Ребёнок: генерация карточки, жизненный цикл (взять → начать → сдать).
 */
@RestController
@RequestMapping
public class MathCardController {

    private final MathCardService mathCardService;

    public MathCardController(MathCardService mathCardService) {
        this.mathCardService = mathCardService;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/math-card-settings")
    public List<MathTopicDto> settings() {
        return mathCardService.parentSettings(CurrentUser.parentId());
    }

    @PutMapping("/api/parent/math-card-settings")
    public List<MathTopicDto> saveSettings(@RequestBody MathTopicSettingsRequest request) {
        return mathCardService.updateSettings(CurrentUser.parentId(), request.items());
    }

    @GetMapping("/api/parent/math-card-approvals")
    public List<MathCardApprovalDto> approvals() {
        return mathCardService.parentApprovals(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/math-card-approvals/{cardId}/approve")
    public void approve(@PathVariable Long cardId) {
        mathCardService.approve(CurrentUser.parentId(), cardId);
    }

    @PostMapping("/api/parent/math-card-approvals/{cardId}/reject")
    public void reject(@PathVariable Long cardId) {
        mathCardService.reject(CurrentUser.parentId(), cardId);
    }

    // ---------- Ребёнок ----------

    @GetMapping("/api/child/math-cards")
    public List<MathCardDto> todayCards() {
        return mathCardService.listToday(CurrentUser.childId());
    }

    @PostMapping("/api/child/math-cards/generate")
    public MathCardDto generate(@RequestBody MathCardGenerateRequest request) {
        return mathCardService.generate(CurrentUser.childId(), request.choice());
    }

    @PostMapping("/api/child/math-cards/{cardId}/request")
    public MathCardDto request(@PathVariable Long cardId) {
        return mathCardService.request(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/math-cards/{cardId}/revoke")
    public MathCardDto revoke(@PathVariable Long cardId) {
        return mathCardService.revoke(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/math-cards/{cardId}/start")
    public MathCardDto start(@PathVariable Long cardId) {
        return mathCardService.start(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/math-cards/{cardId}/submit")
    public MathCardSubmitResult submit(@PathVariable Long cardId, @RequestBody MathCardSubmitRequest request) {
        return mathCardService.submit(CurrentUser.childId(), cardId, request.answers());
    }
}