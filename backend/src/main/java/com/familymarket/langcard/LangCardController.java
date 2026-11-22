package com.familymarket.langcard;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.CardAnswersRequest;
import com.familymarket.dto.LangCardApprovalDto;
import com.familymarket.dto.LangCardDayDto;
import com.familymarket.dto.LangCardDto;
import com.familymarket.dto.LangCardGenerateRequest;
import com.familymarket.dto.LangCardReviewDto;
import com.familymarket.dto.LangCardReviewRequest;
import com.familymarket.dto.LangCardSettingDto;
import com.familymarket.dto.LangCardSubmitRequest;
import com.familymarket.dto.LangCardSubmitResult;
import com.familymarket.dto.LangCardSettingsSaveRequest;
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
 * Эндпоинты карточек иностранного языка.
 * Родитель: настройки видов заданий (время/сложность), словарь (активация слов, статусы),
 * проверка ручных заданий с множителем 0/1/2.
 * Ребёнок: генерация карточки, жизненный цикл (начать → сдать), словарь (изучил/изучает).
 */
@RestController
@RequestMapping
public class LangCardController {

    private final LangCardService service;

    public LangCardController(LangCardService service) {
        this.service = service;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/lang-card-settings")
    public List<LangCardSettingDto> settings() {
        return service.ensureSettings(CurrentUser.parentId()).stream()
                .map(LangCardSettingDto::of)
                .toList();
    }

    @PutMapping("/api/parent/lang-card-settings")
    public List<LangCardSettingDto> saveSettings(@RequestBody LangCardSettingsSaveRequest request) {
        return service.updateSettings(CurrentUser.parentId(), request.items()).stream()
                .map(LangCardSettingDto::of)
                .toList();
    }

    @GetMapping("/api/parent/lang-vocab")
    public List<LangCardService.ParentVocabWord> parentVocab(@RequestParam Long childId) {
        return service.parentVocab(CurrentUser.parentId(), childId);
    }

    @PostMapping("/api/parent/lang-vocab/{wordId}/activate")
    public void activateWord(@PathVariable Long wordId, @RequestParam Long childId) {
        service.activateByParent(CurrentUser.parentId(), childId, wordId);
    }

    @PostMapping("/api/parent/lang-vocab/{wordId}/mark-learned")
    public void markLearned(@PathVariable Long wordId, @RequestParam Long childId) {
        service.markLearnedByParent(CurrentUser.parentId(), childId, wordId);
    }

    @GetMapping("/api/parent/lang-card-approvals")
    public List<LangCardApprovalDto> approvals() {
        return service.parentApprovals(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/lang-card-approvals/{cardId}/approve")
    public void approve(@PathVariable Long cardId) {
        service.approve(CurrentUser.parentId(), cardId);
    }

    @PostMapping("/api/parent/lang-card-approvals/{cardId}/reject")
    public void reject(@PathVariable Long cardId) {
        service.reject(CurrentUser.parentId(), cardId);
    }

    @GetMapping("/api/parent/lang-card-reviews")
    public List<LangCardReviewDto> reviews() {
        return service.parentReviews(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/lang-card-reviews/{cardId}/review")
    public void review(@PathVariable Long cardId, @RequestBody LangCardReviewRequest request) {
        service.review(CurrentUser.parentId(), cardId, request.multiplier(), request.comment());
    }

    // ---------- Ребёнок ----------

    @GetMapping("/api/child/lang-cards")
    public LangCardDayDto todayCards() {
        return service.listToday(CurrentUser.childId());
    }

    @PostMapping("/api/child/lang-cards/generate")
    public LangCardDto generate(@RequestBody LangCardGenerateRequest request) {
        return service.generate(CurrentUser.childId(), request.taskType());
    }

    @PostMapping("/api/child/lang-cards/{cardId}/request")
    public LangCardDto request(@PathVariable Long cardId) {
        return service.request(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/lang-cards/{cardId}/revoke")
    public LangCardDto revoke(@PathVariable Long cardId) {
        return service.revoke(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/lang-cards/{cardId}/start")
    public LangCardDto start(@PathVariable Long cardId) {
        return service.start(CurrentUser.childId(), cardId);
    }

    @PostMapping("/api/child/lang-cards/{cardId}/submit")
    public LangCardSubmitResult submit(@PathVariable Long cardId, @RequestBody LangCardSubmitRequest request) {
        return service.submit(CurrentUser.childId(), cardId, request.answers());
    }

    /** Черновик ответов: сохраняется при вводе и перед сворачиванием страницы. */
    @PutMapping("/api/child/lang-cards/{cardId}/answers")
    public LangCardDto saveAnswers(@PathVariable Long cardId, @RequestBody CardAnswersRequest request) {
        return service.saveAnswers(CurrentUser.childId(), cardId, request.answers());
    }

    @GetMapping("/api/child/lang-vocab")
    public List<LangCardService.VocabWord> childVocab() {
        service.ensureDictionary(CurrentUser.childId());
        return service.childVocab(CurrentUser.childId());
    }
}
