package com.familymarket.mathcard;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.MathCardAnswerRequest;
import com.familymarket.dto.MathCardAnswerResult;
import com.familymarket.dto.MathCardDto;
import com.familymarket.dto.MathCardGenerateRequest;
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
 * Родитель: темы (тумблеры) + матрица базовой сложности.
 * Ребёнок: генерация карточки по выбранному уровню, проверка ответов.
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

    // ---------- Ребёнок ----------

    @GetMapping("/api/child/math-cards/today")
    public MathCardDto today() {
        return mathCardService.today(CurrentUser.childId());
    }

    @PostMapping("/api/child/math-cards/generate")
    public MathCardDto generate(@RequestBody MathCardGenerateRequest request) {
        return mathCardService.generate(CurrentUser.childId(), request.choice());
    }

    @PostMapping("/api/child/math-cards/tasks/{taskId}/answer")
    public MathCardAnswerResult answer(@PathVariable Long taskId, @RequestBody MathCardAnswerRequest request) {
        return mathCardService.answer(CurrentUser.childId(), taskId, request.answer());
    }
}