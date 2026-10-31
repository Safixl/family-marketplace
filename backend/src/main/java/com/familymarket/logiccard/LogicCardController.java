package com.familymarket.logiccard;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.LogicCardApprovalDto;
import com.familymarket.dto.LogicCardDayDto;
import com.familymarket.dto.LogicCardDto;
import com.familymarket.dto.LogicCardGenerateRequest;
import com.familymarket.dto.LogicCardSubmitRequest;
import com.familymarket.dto.LogicCardSubmitResult;
import com.familymarket.dto.LogicTopicDto;
import com.familymarket.dto.LogicTopicSettingsRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Эндпоинты микросервиса динамических логических карточек (зеркало MathCardController).
 * Родитель: темы (тумблеры) + матрица базовой сложности + одобрение запросов.
 * Ребёнок: генерация карточки, жизненный цикл (взять → начать → сдать).
 */
@RestController
@RequestMapping
public class LogicCardController {

    private final LogicCardService logicCardService;

    public LogicCardController(LogicCardService logicCardService) {
        this.logicCardService = logicCardService;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/logic-card-settings")
    public List<LogicTopicDto> settings() {
        return logicCardService.parentSettings(CurrentUser.parentId());
    }

    @PutMapping("/api/parent/logic-card-settings")
    public List<LogicTopicDto> saveSettings(@RequestBody LogicTopicSettingsRequest request) {
        return logicCardService.updateSettings(CurrentUser.parentId(), request.items());
    }

    @GetMapping("/api/parent/logic-card-approvals")
    public List<LogicCardApprovalDto> approvals() {
        return logicCardService.parentApprovals(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/logic-card-approvals/{cardId}/approve")
    public void approve(@PathVariable Long cardId) {
        logicCardService.approve(CurrentUser.parentId(), cardId);
    }

    @PostMapping("/api/parent/logic-card-approvals/{cardId}/reject")
    public void reject(@PathVariable Long cardId) {
        logicCardService.reject(CurrentUser.parentId(), cardId);
    }

    // ---------- Ребёнок ----------

    @GetMapping("/api/child/logic-cards")
    public LogicCardDayDto todayCards() {
        return logicCardService.listToday(CurrentUser.childId());
    }

    @PostMapping("/api/child/logic-cards/generate")
    public LogicCardDto generate(@RequestBody LogicCardGenerateRequest request) {
        return logicCardService.generate(CurrentUser.childId(), request.choice());
    }

    @PostMapping("/api/child/logic-cards/{cardId}/request")
    public LogicCardDto request(@PathVariable Long cardId) {
        return logicCardService.request(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/logic-cards/{cardId}/revoke")
    public LogicCardDto revoke(@PathVariable Long cardId) {
        return logicCardService.revoke(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/logic-cards/{cardId}/start")
    public LogicCardDto start(@PathVariable Long cardId) {
        return logicCardService.start(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/logic-cards/{cardId}/submit")
    public LogicCardSubmitResult submit(@PathVariable Long cardId, @RequestBody LogicCardSubmitRequest request) {
        return logicCardService.submit(CurrentUser.childId(), cardId, request.answers());
    }
}
